import Anthropic from "@anthropic-ai/sdk";
import {
  schemaFor,
  type KngfNote,
  type SoapNote,
  type NoteFormat,
} from "./schemas";
import { KNGF_SYSTEM_PROMPT, kngfUserMessage } from "./prompts/kngf.nl";
import { soapSystemPrompt, soapUserMessage } from "./prompts/soap.en";
import { ok, err, type Result } from "./result";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-4-5";
const MAX_TOKENS = 1024;

let _client: Anthropic | null = null;
function client(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export interface GenerateInput {
  transcript: string;
  format: NoteFormat;
  /** Used only for SOAP, to label the professional in the prompt. */
  profession?: string;
}

export interface GeneratedNote {
  content: KngfNote | SoapNote;
  inputTokens: number;
  outputTokens: number;
}

/** Strip accidental code-fences / prose and return the JSON object substring. */
function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced?.[1]?.trim() ?? trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start !== -1 && end !== -1 ? body.slice(start, end + 1) : body;
}

/**
 * Generate a structured note from a transcript. Validates with zod; on invalid
 * output, retries once with a corrective message; otherwise returns an error
 * (caller keeps the transcript and offers a manual-edit fallback).
 */
export async function generateNote(
  input: GenerateInput,
): Promise<Result<GeneratedNote>> {
  const { transcript, format } = input;
  if (!transcript.trim()) return err("empty_transcript", "Transcript is empty.");

  const system =
    format === "kngf"
      ? KNGF_SYSTEM_PROMPT
      : soapSystemPrompt(input.profession ?? "physiotherapist");
  const userMessage =
    format === "kngf" ? kngfUserMessage(transcript) : soapUserMessage(transcript);
  const schema = schemaFor(format);

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userMessage },
  ];

  let inputTokens = 0;
  let outputTokens = 0;

  for (let attempt = 0; attempt < 2; attempt++) {
    let raw: string;
    try {
      const response = await client().messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0,
        // System prompt as a cacheable block: 90% input savings on repeats.
        system: [
          { type: "text", text: system, cache_control: { type: "ephemeral" } },
        ],
        messages,
      });
      inputTokens += response.usage.input_tokens;
      outputTokens += response.usage.output_tokens;
      raw = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");
    } catch (e) {
      const status = (e as { status?: number })?.status;
      if (status === 429) return err("claude_rate_limit", "Even druk. Probeer over 30 s opnieuw.");
      return err("claude_failed", "Notitie genereren mislukt.");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(raw));
    } catch {
      parsed = undefined;
    }

    const validated = schema.safeParse(parsed);
    if (validated.success) {
      return ok({ content: validated.data, inputTokens, outputTokens });
    }

    // Corrective retry: feed back the bad output and ask for valid JSON only.
    messages.push(
      { role: "assistant", content: raw },
      {
        role: "user",
        content:
          "Your previous response was not valid JSON for the schema. Return ONLY valid JSON matching the schema, with every field present (string or null). No markdown, no commentary.",
      },
    );
  }

  return err(
    "claude_invalid_json",
    "Notitie kon niet automatisch gestructureerd worden. Bewerk handmatig.",
  );
}

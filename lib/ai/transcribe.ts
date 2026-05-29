import OpenAI from "openai";
import type { Language } from "./schemas";
import { ok, err, type Result } from "./result";

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (!_client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export interface Transcription {
  text: string;
  durationSeconds?: number;
}

/**
 * Transcribe an audio file with Whisper.
 * - `language` is passed explicitly ("nl"/"en"); we never rely on auto-detect
 *   for short clinical clips (~5% misdetect on Dutch).
 * - The file's name/extension must match its mime type or Whisper rejects it.
 */
export async function transcribeAudio(
  file: File,
  language: Language,
): Promise<Result<Transcription>> {
  try {
    const res = await client().audio.transcriptions.create({
      file,
      model: "whisper-1",
      language,
      response_format: "json",
      temperature: 0,
    });
    const text = res.text?.trim() ?? "";
    if (!text) return err("whisper_empty", "Geen spraak herkend in de opname.");
    return ok({ text });
  } catch (e) {
    const status = (e as { status?: number })?.status;
    if (status === 429) return err("claude_rate_limit", "Even druk. Probeer over 30 s opnieuw.");
    return err("whisper_failed", "Transcriberen mislukt. Probeer opnieuw of typ de tekst zelf.");
  }
}

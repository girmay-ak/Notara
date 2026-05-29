import { transcribeAudio } from "./transcribe";
import { generateNote } from "./generate";
import { renderNote } from "./render";
import type { KngfNote, SoapNote, NoteFormat, Language } from "./schemas";
import { ok, err, type Result } from "./result";

export interface ProcessInput {
  audio: File;
  format: NoteFormat;
  language: Language;
  profession?: string;
}

export interface ProcessedNote {
  transcript: string;
  content: KngfNote | SoapNote;
  renderedText: string;
  format: NoteFormat;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Full pipeline: audio -> Whisper -> Claude -> validated structured note.
 * Runs inside a Next.js route handler (Node runtime). No AWS.
 */
export async function processAudioToNote(
  input: ProcessInput,
): Promise<Result<ProcessedNote>> {
  const transcription = await transcribeAudio(input.audio, input.language);
  if (!transcription.ok) return transcription;

  const generated = await generateNote({
    transcript: transcription.data.text,
    format: input.format,
    profession: input.profession,
  });
  if (!generated.ok) {
    // Surface the transcript even when structuring failed (manual-edit fallback).
    return err(generated.error.code, generated.error.message);
  }

  return ok({
    transcript: transcription.data.text,
    content: generated.data.content,
    renderedText: renderNote(generated.data.content, input.format),
    format: input.format,
    inputTokens: generated.data.inputTokens,
    outputTokens: generated.data.outputTokens,
  });
}

/** Pick the note format the same way the product does. */
export function pickFormat(
  profession: string,
  language: Language,
): NoteFormat {
  return profession === "physiotherapist" && language === "nl" ? "kngf" : "soap";
}

export type { Result };

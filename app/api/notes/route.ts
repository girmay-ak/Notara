import { NextResponse } from "next/server";
import { processAudioToNote } from "@/lib/ai/pipeline";
import type { NoteFormat, Language } from "@/lib/ai/schemas";

/**
 * The AI pipeline endpoint. Runs entirely inside Next.js on Vercel — no AWS
 * Lambda. A 60–90s clip transcribes + structures in ~6–10s; `maxDuration`
 * gives generous headroom (raise toward 300 on Vercel Pro if needed).
 *
 * Accepts multipart/form-data: audio (File), format, language, profession.
 * Audio is never persisted here — it is consumed and discarded.
 */
export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  const form = await request.formData();
  const audio = form.get("audio");
  const format = (form.get("format") as NoteFormat) ?? "kngf";
  const language = (form.get("language") as Language) ?? "nl";
  const profession = (form.get("profession") as string) ?? "physiotherapist";

  if (!(audio instanceof File)) {
    return NextResponse.json(
      { ok: false, error: { code: "no_audio", message: "Geen audio ontvangen." } },
      { status: 400 },
    );
  }

  const result = await processAudioToNote({ audio, format, language, profession });

  if (!result.ok) {
    return NextResponse.json(result, { status: 422 });
  }
  return NextResponse.json(result);
}

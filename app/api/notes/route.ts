import { NextResponse } from "next/server";
import { processAudioToNote } from "@/lib/ai/pipeline";
import { getAuthedContext } from "@/lib/supabase/auth";
import type { NoteFormat, Language } from "@/lib/ai/schemas";
import type { Json } from "@/lib/supabase/database.types";

/**
 * The AI pipeline endpoint. Runs entirely inside Next.js on Vercel — no AWS.
 * A 60–90s clip transcribes + structures in ~6–10s.
 *
 * Auth is token-agnostic (cookie for web, Bearer for mobile) — see docs/API.md —
 * and the note is persisted server-side under the user's RLS context, so a
 * future mobile app reuses this exact endpoint and gets a saved note back.
 *
 * Accepts multipart/form-data: audio (File), format, language, profession.
 * Audio is consumed in-memory and never persisted.
 */
export const runtime = "nodejs";
export const maxDuration = 120;
// Keep PHI processing (audio → Whisper → Claude) in the EU.
export const preferredRegion = "fra1";

export async function POST(request: Request) {
  const ctx = await getAuthedContext(request);
  if (!ctx) {
    return NextResponse.json(
      { ok: false, error: { code: "unauthorized", message: "Niet ingelogd." } },
      { status: 401 },
    );
  }
  const { user, supabase } = ctx;

  const form = await request.formData();
  const audio = form.get("audio");
  const format = (form.get("format") as NoteFormat) ?? "kngf";
  const language = (form.get("language") as Language) ?? "nl";
  const profession = (form.get("profession") as string) ?? "physiotherapist";
  const durationRaw = form.get("durationSec");
  const durationSeconds = durationRaw ? Number(durationRaw) : null;

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

  const { data: inserted, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      format: result.data.format,
      status: "completed",
      language,
      transcript: result.data.transcript,
      content: result.data.content as unknown as Json,
      rendered_text: result.data.renderedText,
      duration_seconds: durationSeconds,
      claude_input_tokens: result.data.inputTokens,
      claude_output_tokens: result.data.outputTokens,
    })
    .select("id")
    .single();

  const row = inserted as { id: string } | null;
  if (error || !row) {
    return NextResponse.json(
      { ok: false, error: { code: "save_failed", message: "Notitie opslaan mislukt." } },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    data: {
      id: row.id,
      format: result.data.format,
      content: result.data.content,
      renderedText: result.data.renderedText,
      transcript: result.data.transcript,
    },
  });
}

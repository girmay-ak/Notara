import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { NoteResult } from "@/components/features/notes/NoteResult";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatLabel } from "@/lib/format";
import type { KngfNote, SoapNote } from "@/lib/ai/schemas";

interface NoteDetail {
  id: string;
  format: "kngf" | "soap";
  content: unknown;
  created_at: string;
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("notes")
    .select("id, format, content, created_at")
    .eq("id", id)
    .single();
  const note = data as NoteDetail | null;
  if (!note || !note.content) notFound();

  const title = `${formatLabel(note.format)}-notitie · ${formatDateTime(note.created_at)}`;

  return (
    <div>
      <Link
        href="/notes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Notities
      </Link>
      <NoteResult
        content={note.content as KngfNote | SoapNote}
        format={note.format}
        title={title}
      />
    </div>
  );
}

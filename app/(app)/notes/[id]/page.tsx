import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { NoteResult } from "@/components/features/notes/NoteResult";
import { sampleNotes } from "@/lib/sample-notes";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = sampleNotes.find((n) => n.id === id);
  if (!note) notFound();

  const title = `${note.format === "kngf" ? "SOEP" : "SOAP"}-notitie · ${note.when}`;

  return (
    <div>
      <Link
        href="/notes"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Notities
      </Link>
      <NoteResult content={note.content} format={note.format} title={title} />
    </div>
  );
}

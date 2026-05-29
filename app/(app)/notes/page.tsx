import Link from "next/link";
import { Search, AudioLines, Clock, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, snippet, formatLabel } from "@/lib/format";
import { nl } from "@/lib/i18n/nl";

interface NoteRow {
  id: string;
  format: "kngf" | "soap";
  rendered_text: string | null;
  transcript: string | null;
  created_at: string;
}

export default async function NotesPage() {
  const t = nl.notes;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = user
    ? await supabase
        .from("notes")
        .select("id, format, rendered_text, transcript, created_at")
        .order("created_at", { ascending: false })
    : { data: null };
  const notes = (data ?? []) as NoteRow[];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-1 text-muted-foreground">{t.subtitle}</p>

      {notes.length === 0 ? (
        <Card className="mt-8 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-7" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">{t.empty}</h2>
          <p className="max-w-xs text-sm text-muted-foreground">{t.emptyBody}</p>
          <Link href="/record" className={buttonVariants({ className: "mt-2" })}>
            {t.emptyCta}
          </Link>
        </Card>
      ) : (
        <>
          <div className="relative mt-6">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder={t.search} className="h-12 pl-10" />
          </div>

          <div className="mt-5 space-y-4">
            {notes.map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <Card className="p-5 transition-colors hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant={note.format === "kngf" ? "soep" : "soap"}>
                      {formatLabel(note.format)}
                    </Badge>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="size-3.5" /> {formatDateTime(note.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-foreground">
                    {snippet(note.rendered_text ?? note.transcript)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

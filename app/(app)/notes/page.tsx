import Link from "next/link";
import { Search, AudioLines, Clock, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { nl } from "@/lib/i18n/nl";
import { sampleNotes } from "@/lib/sample-notes";

export default function NotesPage() {
  const t = nl.notes;
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
      <p className="mt-1 text-muted-foreground">{t.subtitle}</p>

      <div className="relative mt-6">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t.search} className="h-12 pl-10" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="soep" className="px-3 py-1">{t.filterAll}</Badge>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          {t.filterDate}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">SOEP</span>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">SOAP</span>
        <span className="ml-auto text-xs text-muted-foreground">{t.sortNewest}</span>
      </div>

      <div className="mt-5 space-y-4">
        {sampleNotes.map((note) => (
          <Link key={note.id} href={`/notes/${note.id}`}>
            <Card className="p-5 transition-colors hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <Badge variant={note.format === "kngf" ? "soep" : "soap"}>
                  {note.format === "kngf" ? "SOEP" : "SOAP"}
                </Badge>
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <AudioLines className="size-4 text-brand-500" />
                  {note.topic}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{note.snippet}</p>
              <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="size-3.5" /> {note.when}
                </span>
                <span className="flex items-center gap-1.5">
                  <Timer className="size-3.5" /> {note.durationMin}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

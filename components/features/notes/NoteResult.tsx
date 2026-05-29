import { Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CopyButton } from "./CopyButton";
import { renderNote } from "@/lib/ai/render";
import {
  KNGF_LABELS,
  SOAP_LABELS,
  type KngfNote,
  type SoapNote,
  type NoteFormat,
} from "@/lib/ai/schemas";
import { nl } from "@/lib/i18n/nl";

/**
 * Renders a structured note as section cards with per-section + copy-all.
 * Null fields are hidden (we never paste empty headings into an EPD).
 */
export function NoteResult({
  content,
  format,
  title,
}: {
  content: KngfNote | SoapNote;
  format: NoteFormat;
  title: string;
}) {
  const labels = format === "kngf" ? KNGF_LABELS : SOAP_LABELS;
  const values = content as Record<string, string | null>;
  const entries: { key: string; label: string; value: string }[] = [];
  for (const key of Object.keys(labels) as Array<keyof typeof labels>) {
    const value = values[key];
    if (value) entries.push({ key, label: labels[key], value });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <CopyButton
          value={renderNote(content, format)}
          variant="default"
          label={nl.note.copyAll}
          copiedLabel={nl.note.copiedAll}
        />
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl bg-amber-soft px-4 py-3 text-sm text-foreground">
        <Info className="mt-0.5 size-5 shrink-0 text-amber" />
        <p>{nl.note.verifyBanner}</p>
      </div>

      <div className="mt-5 space-y-4">
        {entries.map((e) => (
          <Card key={e.key} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                {e.label}
              </span>
              <CopyButton value={e.value} iconOnly variant="ghost" />
            </div>
            <p className="mt-3 whitespace-pre-line text-[17px] leading-relaxed text-foreground">
              {e.value}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}

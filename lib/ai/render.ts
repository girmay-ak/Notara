import {
  KNGF_LABELS,
  SOAP_LABELS,
  type KngfNote,
  type SoapNote,
  type NoteFormat,
} from "./schemas";

/**
 * Render a structured note to plain text for one-click copy into an EPD.
 * Null fields are omitted so the clinician isn't pasting empty headings.
 */
export function renderNote(
  content: KngfNote | SoapNote,
  format: NoteFormat,
): string {
  const labels = format === "kngf" ? KNGF_LABELS : SOAP_LABELS;
  return (Object.keys(labels) as Array<keyof typeof labels>)
    .map((key) => {
      const value = (content as Record<string, string | null>)[key];
      return value ? `${labels[key]}:\n${value}` : null;
    })
    .filter((line): line is string => line !== null)
    .join("\n\n");
}

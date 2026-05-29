/** Format a timestamptz string for display in the user's locale (NL default). */
export function formatDateTime(iso: string, locale = "nl-NL"): string {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** A short one-line preview of note text. */
export function snippet(text: string | null | undefined, max = 140): string {
  if (!text) return "";
  const s = text.replace(/\s+/g, " ").trim();
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export function formatLabel(format: "kngf" | "soap"): string {
  return format === "kngf" ? "SOEP" : "SOAP";
}

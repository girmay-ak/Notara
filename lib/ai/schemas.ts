import { z } from "zod";

/**
 * Output schemas for the two note formats. Every field is required to be
 * *present* but may be null (a missing field must be explicit null, never
 * fabricated text). The model is validated against these; on failure we retry
 * once, then mark the note failed.
 */

// A clinical field: a non-empty string, or null when not derivable.
const field = z.string().min(1).nullable();

export const kngfNoteSchema = z.object({
  subjectief: field,
  objectief: field,
  evaluatie: field,
  plan: field,
  behandeling_uitgevoerd: field,
  vervolgafspraak: field,
  rode_vlaggen: field,
  fysiotherapeutische_diagnose: field,
});

export const soapNoteSchema = z.object({
  subjective: field,
  objective: field,
  assessment: field,
  plan: field,
  interventions_performed: field,
  follow_up: field,
  red_flags: field,
});

export type KngfNote = z.infer<typeof kngfNoteSchema>;
export type SoapNote = z.infer<typeof soapNoteSchema>;

export type NoteFormat = "kngf" | "soap";
export type Language = "nl" | "en";

export function schemaFor(format: NoteFormat) {
  return format === "kngf" ? kngfNoteSchema : soapNoteSchema;
}

/** Human-readable labels per field, used by the renderer and the UI. */
export const KNGF_LABELS: Record<keyof KngfNote, string> = {
  subjectief: "Subjectief",
  objectief: "Objectief",
  evaluatie: "Evaluatie",
  plan: "Plan",
  behandeling_uitgevoerd: "Behandeling uitgevoerd",
  vervolgafspraak: "Vervolgafspraak",
  rode_vlaggen: "Rode vlaggen",
  fysiotherapeutische_diagnose: "Fysiotherapeutische diagnose",
};

export const SOAP_LABELS: Record<keyof SoapNote, string> = {
  subjective: "Subjective",
  objective: "Objective",
  assessment: "Assessment",
  plan: "Plan",
  interventions_performed: "Interventions performed",
  follow_up: "Follow-up",
  red_flags: "Red flags",
};

---
name: notara-note-quality
description: Iterate on and evaluate Notara's KNGF/SOEP and SOAP note-generation prompts. Use when changing files in lib/ai/prompts/ or lib/ai/schemas.ts, when adding transcript fixtures, when investigating bad/hallucinated/invalid note output, or when validating note quality (Rung 0 of the validation ladder). The single highest-leverage activity in this project.
---

# Notara — Note Quality Iteration

The product is only as good as the structured note. This skill is the loop for
improving and judging it. See `docs/VALIDATION-PLAN.md` (Rung 0).

## The pipeline (where things live)

- `lib/ai/prompts/kngf.nl.ts` — Dutch KNGF/SOEP system prompt (the crown jewel)
- `lib/ai/prompts/soap.en.ts` — English SOAP system prompt
- `lib/ai/schemas.ts` — zod output schemas + field labels
- `lib/ai/generate.ts` — Claude call, JSON extraction, validation, 1 retry
- `lib/ai/render.ts` — structured note → plain text for EPD copy
- `fixtures/transcripts.json` — sample transcripts to evaluate against
- `scripts/eval.ts` — the runner (`npm run eval`)

## Workflow

1. **Run the baseline:** `npm run eval` (needs `ANTHROPIC_API_KEY` in
   `.env.local`). Read every rendered note end to end.
2. **Judge against the hard rules** (these are non-negotiable for clinical use):
   - **No hallucination.** Every fact in the note must trace to the transcript.
     If the note invents an NPRS score, ROM degree, diagnosis, or treatment that
     wasn't spoken — that's a critical failure, fix the prompt.
   - **Missing → `null`.** Fields not derivable from the transcript must be
     `null`, never filler text like "n.v.t." or a plausible guess. Use the
     sparse fixture (`kngf-rug-sparse-02`) to check this.
   - **No PII.** No full name, DOB, or BSN in output.
   - **Valid JSON.** Must pass the zod schema (eval marks ✗ otherwise).
   - **Professional, concise Dutch/English**, correct SOEP/SOAP placement
     (e.g. patient-reported pain = Subjectief, measured ROM = Objectief).
3. **Change ONE thing** in the prompt, re-run, compare. Keep prompts in version
   control so diffs are reviewable.
4. **Add fixtures** for any failure you find (edge cases: very short clips,
   mixed Dutch/English, multiple complaints, no measurements). More fixtures =
   more confidence.
5. **The real gate:** a practicing physiotherapist grades ~20 outputs as
   "trustworthy, light edits only." Until then, do not build UI/auth/billing.

## When editing prompts

- Keep the system prompt **static** (it's sent as a cacheable block — changing
  it per-request defeats prompt caching). Per-session data goes in the user
  message (`kngfUserMessage` / `soapUserMessage`).
- If you change a schema field, update: the prompt's JSON schema block, the zod
  schema, and the `*_LABELS` map — all three, or render/validation drifts.
- Adding a new format → new prompt file + schema + labels + `schemaFor` +
  `pickFormat`.

## Commands

```bash
npm run eval                 # all fixtures
npm run eval kngf-knie-01    # one fixture by id
npm run typecheck            # after any lib/ai change
```

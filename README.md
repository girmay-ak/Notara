# Notara

AI-powered session-note generator for European allied health professionals.
Speak a 60–90 second voice memo → get a structured **KNGF/SOEP** (Dutch
physiotherapy) or **SOAP** (English) note → paste it into your EPD/EPR.

> **Status:** Pre-validation. We are proving note quality and willingness-to-pay
> before building the full production system. See [`docs/VALIDATION-PLAN.md`](docs/VALIDATION-PLAN.md).

## What we're building (MVP = "one thing")

One Next.js app on **Vercel**, backed by **Supabase** (DB/Auth/Storage) and
**Stripe** (payments). The AI pipeline (Whisper → Claude) runs **inside Next.js
route handlers** — no AWS, no separate services. We expand the architecture only
after users prove they want it.

- **Full stack & rationale:** [`docs/STACK.md`](docs/STACK.md)
- **Lean validation roadmap:** [`docs/VALIDATION-PLAN.md`](docs/VALIDATION-PLAN.md)
- **Production north-star (long term):** [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md)
- **Coding conventions for AI assistants:** [`CLAUDE.md`](CLAUDE.md)

## Quick start (AI pipeline eval)

The heart of Notara is note quality. You can test it with text transcripts
before any UI exists:

```bash
npm install
cp .env.example .env.local        # add ANTHROPIC_API_KEY
npm run eval                       # runs sample transcripts through Claude
```

This prints structured KNGF/SOAP notes for the fixtures in `fixtures/`. Have a
working physiotherapist grade the output — that is the single highest-leverage
validation step.

## Project layout

```
app/            Next.js App Router (UI + API route handlers)
lib/ai/         The AI pipeline: prompts, schemas, transcribe, generate
fixtures/       Sample transcripts for note-quality evaluation
scripts/        eval.ts — run the pipeline against fixtures
docs/           STACK, VALIDATION-PLAN, BLUEPRINT
.claude/skills/ Project skills for AI-assisted development
```

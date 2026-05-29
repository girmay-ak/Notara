# Notara — AI Coding Conventions

AI-powered KNGF/SOAP session-note generator for EU allied health professionals.
Read [`docs/STACK.md`](docs/STACK.md) (what we build now) and
[`docs/VALIDATION-PLAN.md`](docs/VALIDATION-PLAN.md) (why) before large changes.

## Stack (lean MVP — "one thing on Vercel")

Next.js 15 App Router · TypeScript `strict` · Tailwind v4 · shadcn/ui (New York)
· Supabase (EU: DB/Auth/Storage/RLS) · Stripe · OpenAI Whisper · Anthropic Claude.
**No AWS.** The AI pipeline runs in **Next.js route handlers**, not Lambda.

## Build order (minimise rewrites)

Validation-first: **AI prompts (in isolation, with fixtures) → DB schema + RLS →
server actions/route handlers → UI.** UI last. We are currently on Rung 0 of the
validation ladder — the AI pipeline. Do not build auth/billing/patients until
the pipeline's note quality is validated by a real physiotherapist.

## Rules

- **Server Components by default.** Add `'use client'` only for interactivity.
- **Data access:** `lib/supabase/server.ts` in RSC/actions/route handlers,
  `client.ts` in client components. Never mix. Never expose
  `SUPABASE_SERVICE_ROLE_KEY` to the client.
- **RLS:** every `public.*` table has RLS on, with separate policies per
  operation (never `FOR ALL`). Index every column used in a policy (`user_id`).
- **AI pipeline is pure & testable:** keep `transcribe()` and `generateNote()`
  as pure functions in `lib/ai/`. Route handlers orchestrate; logic stays
  testable without HTTP. Edit prompts in `lib/ai/prompts/` and re-run the eval.
- **Prompts are the crown jewels.** Use **only transcript info**, `null` for
  missing fields, never invent measurements/diagnoses, never emit PII
  (name/DOB/BSN). Validate every model output with zod (`lib/ai/schemas.ts`);
  one corrective retry, then `status='failed'` + keep transcript.
- **Claude:** model `claude-sonnet-4-5`; set system prompt as a cacheable block
  (prompt caching); `temperature` low for structured output. Haiku 4.5 only for
  classification.
- **Whisper:** `whisper-1`, pass `language` explicitly ("nl"/"en"), never rely
  on auto-detect for short clips; file extension must match the mime type.
- **Forms:** react-hook-form + zod; one schema shared client + server action.
- **All user-facing copy** comes from `lib/i18n/{nl,en}.ts`. NL is primary. Never
  hardcode strings.
- **Mutations** = server actions/handlers returning a typed
  `{ ok: true, data } | { ok: false, error: { code, message } }`. Never throw
  across the boundary. `code` is a stable machine string; i18n maps it to text.
- **Money** in cents (integer) or `numeric(10,2)` — never floats.
- **Dates:** `timestamptz` in DB, `Date` in TS, format with `Intl.DateTimeFormat`
  + user locale.
- **Audit** sensitive writes (when the table exists) via a single helper.

## Patterns

- Page = thin Server Component; logic in `lib/`; UI atoms in `components/ui`;
  feature components in `components/features/<feature>`.
- Errors: machine `code` (e.g. `mic_denied`, `claude_invalid_json`) + human
  message; i18n lookup on the client.

## Don't

- Don't add AWS, Lambda, CDK, or a separate AI service — it lives in Next.js.
- Don't add Prisma, tRPC, NextAuth, Redux, Drizzle (yet) — supabase-js + actions
  + Supabase Auth + URL/RSC state (Zustand only for the recorder).
- Don't add Resend/Sentry/Plausible/Upstash until the validation ladder says so.
- Don't bypass RLS with the service role from a client-reachable route.
- Don't `dangerouslySetInnerHTML` note content. Don't persist audio longer than
  needed (delete after transcription).

## Commands

```bash
npm run eval        # run sample transcripts through the AI pipeline
npm run dev         # Next.js dev server
npm run typecheck   # tsc --noEmit
npm run lint
```

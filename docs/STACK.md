# Notara — Stack Decisions (Lean MVP)

This is the **decided** stack for validation and the first paying users. It is a
deliberate simplification of the production north-star in
[`BLUEPRINT.md`](BLUEPRINT.md). The guiding principle:

> **One thing.** Build everything inside one Next.js app on Vercel, backed by
> Supabase and Stripe. No AWS. No microservices. Expand only when users prove
> they want more.

## The decision

| Concern | MVP decision | What we dropped (vs blueprint) & why |
|---|---|---|
| **Hosting** | **Vercel** (Pro from launch — Hobby forbids commercial use) | Nothing. One deploy target. |
| **Framework** | **Next.js 15 App Router**, TypeScript `strict` | — |
| **AI pipeline** | **Next.js Route Handler** (Node runtime, `maxDuration` up to 300s on Pro) calling Whisper → Claude | **Dropped AWS Lambda + CDK + Python + separate repo.** A 60–90s clip transcribes in ~5–10s; the 15-min Lambda timeout solved a problem we don't have. This is the single biggest simplification. |
| **Database / Auth / Storage** | **Supabase** (EU `eu-central-1`, Frankfurt) — Postgres + Auth + RLS + Storage | Kept. It *is* the "one backend." |
| **DB access** | **`@supabase/supabase-js` + generated TS types** | **Dropped Drizzle for MVP.** Fewer moving parts. Add Drizzle later if complex typed reads hurt. |
| **Payments** | **Stripe** — Checkout + Customer Portal + one webhook + Stripe Tax | Kept, but minimal: 2 prices, ~5 webhook events. |
| **Audio recording** | Native `MediaRecorder` (webm/opus → mp4 fallback for iOS) | — |
| **Styling / UI** | **Tailwind v4 + shadcn/ui** (New York), Lucide icons | — |
| **Forms** | react-hook-form + zod (one schema, client + server) | — |
| **Email** | **Supabase default emails** for MVP | **Deferred Resend.** Add when we need branded trial-reminder emails. |
| **Monitoring** | **Vercel built-in logs + Analytics** | **Deferred Sentry & Plausible.** Zero-config is enough at <50 users. |
| **Rate limiting** | Postgres table (count per user/hour) | **Deferred Upstash Redis.** No extra vendor. |

### MVP vendor count: **5** (Vercel, Supabase, Stripe, OpenAI, Anthropic)
Down from the blueprint's 9. AWS, Resend, Sentry, Plausible, Upstash all wait.

## AI pipeline — how it runs without AWS

```
Browser (MediaRecorder)
  │  1. POST audio blob → /api/notes  (or upload to Supabase Storage signed URL)
  ▼
Next.js Route Handler  (runtime = "nodejs", maxDuration = 300)
  │  2. OpenAI Whisper  (whisper-1, language="nl"|"en", temperature=0)
  │  3. Anthropic Claude (claude-sonnet-4-5, KNGF or SOAP system prompt,
  │       prompt caching on the system prompt)
  │  4. zod-validate the JSON  → 1 retry on failure → else status=failed
  │  5. write note to Supabase, delete audio
  ▼
Browser polls /api/notes/[id] (or Supabase Realtime) until completed
```

For the **earliest** validation prototype we can skip Storage entirely and POST
the blob straight to the route handler (audio never persisted) — smaller GDPR
surface. We add Storage + signed URLs when audio gets large enough to need it.

## Models & cost (unchanged from blueprint)

- **Whisper** `whisper-1` @ $0.006/min, `language` set explicitly (don't trust
  auto-detect on short Dutch clips).
- **Claude Sonnet 4.5** `claude-sonnet-4-5` ($3/$15 per MTok) for notes; **Haiku
  4.5** only for cheap classification. Prompt caching on the system prompt.
- **~€0.014–0.015 per note.** €100 of API budget ≈ ~10,000 notes — far more than
  needed to validate.

> **Pricing caveat:** verify Whisper/Claude rates on the vendor pages before
> committing — they shift often.

## What "expand later" looks like

When usage justifies it (the order roughly follows the blueprint):
1. Resend for branded emails → 2. Sentry (EU) + Plausible → 3. Drizzle if reads
get complex → 4. Upstash for rate limiting at scale → 5. *Only if a clip ever
needs >300s* would we revisit a dedicated worker — and even then Vercel
background functions before AWS.

## Environment variables (MVP)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY        # server only
OPENAI_API_KEY                   # Whisper
ANTHROPIC_API_KEY                # Claude
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
NEXT_PUBLIC_STRIPE_PRICE_ANNUAL
```

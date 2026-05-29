# Notara — Production Blueprint (North Star)

> This is the **long-term production target**. For what we're actually building
> *first*, see [`STACK.md`](STACK.md) (lean MVP) and
> [`VALIDATION-PLAN.md`](VALIDATION-PLAN.md). The MVP deliberately defers most of
> the vendors and features below until users prove demand.

**Product:** AI-powered session-note generator for European allied health
professionals (notara.com). Speak a 60–90s memo → structured KNGF/SOEP (Dutch
physio) or SOAP (English) note → paste into EPD.

## 1. Production stack (full)

Next.js 14/15 App Router + TS strict + Tailwind v4 + shadcn/ui on **Vercel Pro
(fra1)** → **Supabase EU** (Postgres/Auth/Storage/RLS) → [in production:
**AWS Lambda EU** for the Whisper+Claude pipeline — *MVP keeps this in Next.js
route handlers instead*] → **Stripe** (Checkout + Tax + Portal) → **Resend**
(email) → **Plausible** (analytics) → **Sentry EU** (monitoring).

- **STT:** OpenAI Whisper `whisper-1` @ $0.006/min, `language` set explicitly.
- **LLM:** Claude Sonnet 4.5 (`claude-sonnet-4-5`) primary; Haiku 4.5 for
  classification. Prompt caching on system prompt. ~€0.014/note.
- **DB access:** Drizzle ORM + supabase-js (hybrid). *MVP uses supabase-js only.*
- **State:** URL state + RSC + Zustand only for the recorder machine.
- **Forms:** react-hook-form + zod, shared client/server schemas.
- **Upload:** browser → Supabase Storage signed-upload URL (avoids 4.5MB action
  limit).

## 2. Folder structure (App Router)

`app/(marketing)` public landing/pricing/legal · `app/(auth)` login/signup/reset
/callback · `app/(app)` protected: dashboard, record, patients, notes, settings
(billing, data) · `app/api` stripe/webhook, ai/transcribe, health ·
`components/ui` (shadcn) + `components/features/{recording,notes,patients,billing}`
· `lib/{supabase,ai,stripe,email,i18n,audit,ratelimit}` · `db/{schema,migrations,seed}`.

## 3. Database schema (Supabase Postgres)

Enums: `profession`, `note_format` (kngf|soap), `note_status`
(processing|completed|failed), `subscription_status`.

Tables (all RLS-enabled, per-operation policies, `user_id` indexed):
- **profiles** (1:1 auth.users): profession, preferred_language/format,
  practice_name, `trial_ends_at` (+14d), feature_flags jsonb.
- **patients** (pseudonymous — no DOB/BSN): display_name (e.g. "Mw. Jansen
  1972"), external_ref, notes_count, archived_at.
- **notes**: patient_id, format, status, language, audio_path (nulled after
  60s), transcript, content jsonb, rendered_text, duration, cost/token metrics,
  error_code/message.
- **subscriptions** (1:1, mirrors Stripe): stripe ids, status,
  current_period_end, cancel_at_period_end, trial_end.
- **audit_log** (append-only): user_id, action, entity, entity_id, metadata, ip.

Triggers: `set_updated_at`; `handle_new_user` auto-creates profile +
trialing subscription on signup. Storage bucket `audio` (private, 5MB limit,
mime whitelist), path `audio/{user_id}/{note_id}.{ext}`, RLS by folder = uid.

## 4. AI pipeline

Flow: record → `createNoteAndSignedUrl()` (note row `processing` + 5-min signed
URL) → browser uploads blob → `processNote(noteId)` → [worker] downloads audio →
Whisper → Claude (format-specific prompt) → zod-validate → write transcript/
content/rendered_text/`completed` → delete audio → browser polls/Realtime.

**Format detection:** default `profile.preferred_format`; KNGF when
physiotherapist+nl; SOAP otherwise; manual override persisted per-user.

**Prompts** (full text lives in `lib/ai/prompts/`):
- **KNGF (nl):** fysiotherapeutisch assistent; SOEP structure (Subjectief,
  Objectief, Evaluatie, Plan); use ONLY transcript info; `null` for missing
  fields; no BSN/name/DOB; valid JSON only. Schema: subjectief, objectief,
  evaluatie, plan, behandeling_uitgevoerd, vervolgafspraak, rode_vlaggen,
  fysiotherapeutische_diagnose.
- **SOAP (en):** clinical scribe; subjective, objective, assessment, plan,
  interventions_performed, follow_up, red_flags.

**Validation:** zod for both shapes; on fail → 1 retry with corrective message;
on 2nd fail → `status=failed`, keep transcript, offer manual edit.

**Whisper config:** `whisper-1`, explicit `language`, `response_format=json`,
`temperature=0`, correct file extension. **Non-streaming**; 4-step progress UI
(Uploading → Transcribing → Structuring → Done).

**Limits:** ≤90s recording, ≤5MB upload, 32kbps mono opus. Rate limit 30/h,
200/day per user; 5 signups/h per IP.

## 5. Responsive / mobile-first

Tailwind breakpoints. Mobile: bottom nav (Dashboard/Record/Patients/Settings),
96px circular record FAB, ≥44px targets. Tablet: icon rail. Desktop: 240px
sidebar + 1080px content. Minimal PWA (manifest + "Add to Home Screen"; never
cache audio/notes). `PermissionGate` pre-prompt for mic. **iOS Safari quirks:**
MediaRecorder ≥14.3; mp4/aac pre-18.4 (mime cascade + matching extension);
gesture-gated audio; pauses on background → warn on visibilitychange; HTTPS.

## 6. Design system

Forest-green brand (`--brand-700 #1F4D3D` primary), amber accent, OKLCH-ready CSS
vars, light+dark. Inter (UI) + Source Serif 4 (landing headers). 4px spacing
grid, 16px body / 18px note text. Lucide icons. Framer Motion only for mic
pulse, result entry, mobile sheet. unDraw line-art for empty states. Sonner
toasts. Dark mode in MVP (system default).

## 7. Microcopy (NL primary, EN mirror)

Stored in `lib/i18n/{nl,en}.ts`. Landing hero: *"Klaar met avonden typen?"*
Time-based dashboard greeting. Record screen states. Result screen with per-
section + "Kopieer alles". 40+ error strings (`lib/i18n/errors.ts`). React Email
templates: welcome, verification, trial day 10/13, payment succeeded/failed,
canceled, export ready, account deleted. Legal copy outlines: privacy, terms,
DPA (BoZ model).

## 8. Icons (Lucide)

Dashboard=LayoutDashboard, Patients=Users, Notes=FileText, Record=Mic,
Stop=Square, Settings, Billing=CreditCard, Copy/Check, Trash2, etc. (full map in
blueprint source).

## 9. Auth

Supabase Auth, **email+password with mandatory verification**; magic link
secondary; no social OAuth. JWT 1h, refresh rotation, password ≥10 chars.
Clients: `lib/supabase/{client,server,middleware}.ts`. Middleware protects
`(app)/*`, refreshes tokens, redirects. Always `getUser()` (not getSession) +
RLS as second defence. Account deletion (Art.17): audit → `admin.deleteUser`
(cascade) → Stripe cancel+delete → 30-day audit purge → email.

## 10. Stripe

Product *Notara Solo*: `price_solo_monthly` €29 + `price_solo_annual` €249, BTW
21% inclusive, Stripe Tax (NL origin). 14-day trial enforced **in-app** (no card
upfront). Day 10/13 reminder emails via Vercel cron. On expiry: middleware locks
write paths → `/trial-ended`. Webhook (raw body, signature-verified): checkout.
session.completed, subscription.created/updated/deleted, invoice.payment_
succeeded/failed. Idempotency via `stripe_events` table. Local: `stripe listen`.

## 11. GDPR & legal

DPA = **BoZ Model Verwerkersovereenkomst** (practice = controller, Notara =
processor). Privacy policy + terms + cookie statement + `/subprocessors` page.
Subprocessors: Supabase, Vercel, [AWS], OpenAI (no training), Anthropic (no
training), Stripe, Resend, Sentry, Plausible. Retention: audio ≤60s, notes
during sub +30d, audit 12mo, Stripe 7y. Art.20 export = ZIP (profile/patients/
notes/audit). Schrems II: EU regions + SCCs in DPA. **Lawyer review ~€600–1,200**
one-time. Have a physio review the KNGF prompt + 20 outputs.

## 12. Security

HSTS, CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy
(microphone=self). Server-action origin check + SameSite=Lax. Webhook signature.
Rate limiting. Secrets in Vercel env (90-day rotation). Parameterised queries
only. No `dangerouslySetInnerHTML` on notes. zod on all external input. Storage
mime/size whitelist + path ownership check. Audit sensitive actions.

## 13. Dev workflow

pnpm/npm + Supabase CLI (local stack), migrations via `supabase migration new`,
`db reset` to test. Trunk `main` + feature branches. Vercel preview per PR.
Tests: **Vitest** (prompts snapshot, zod, formatters), integration vs local
Supabase, **Playwright** E2E critical path (mocked OpenAI/Anthropic). CI:
lint+typecheck+test+playwright.

## 14. AI-coding conventions

See [`../CLAUDE.md`](../CLAUDE.md).

## 15. 6-week build plan (production MVP)

W1 AI pipeline (alone) · W2 auth+DB+landing · W3 record flow+note display ·
W4 dashboard+patients · W5 Stripe+trial · W6 GDPR+polish+launch. Each week ends
with a concrete "Done =" gate.

## 16. Post-launch roadmap

M1–2 feedback only · M3 native mobile (if ≥30% mobile web) · M3–4 EPD
integration (Intramed partner programme; no public API) · M4 profession
expansion · M5–6 country expansion (BE→DE) · pricing experiments (Praktijk tier
€79/5 therapists) · growth: outbound to Amsterdam/Utrecht practices → KNGF/NVFL
forums → content SEO → ProductHunt EU → paid ads last.

## 17. Risks & mitigations

AI hallucination (transcript-only prompt, "Controleer voor opslag" banner, no
auto-submit, 5% QA sample) · bad audio (RMS warning) · MediaRecorder variance
(mime cascade, test matrix) · webhook failures (idempotency + daily reconcile
cron) · RLS misconfig (per-PR review + `test:rls` suite) · GDPR (quarterly
self-audit) · solo burnout (hard scope cuts) · vendor outage (Haiku fallback,
queue Whisper retries) · Schrems II (SCCs) · **price validation: sell 5 annual
subs before week 6.**

## 18. Costs (≈)

0 / 10 / 50 / 100 paying users ≈ **€28 / €72 / €170 / €305 per month**
(excl. Stripe % and one-time lawyer ~€600–1,200). Gross margin ~85% at scale.
€100 API budget ≈ 10,000 notes. Vercel **Pro** mandatory (Hobby = no commercial
use). Supabase Pro the day you take a paid customer (DPA needs Pro).

---

## Caveats (verify before committing)

- Whisper/Claude **prices** shift — check vendor pages.
- Whisper **Dutch WER** ~5–8% clean adult speech; worse for elderly/children/
  non-native — track real failure rate.
- **Schrems II** residual risk: EU regions mitigate but US-HQ'd vendors retain
  CLOUD-Act exposure; disclose via SCCs.
- **KNGF prompt** must be physio-reviewed before public launch.
- **Intramed** has no public API — partner programme, 6+ month BD project.
- **Card-free trial** → more signups, more freeloaders; A/B test if conversion
  <5%.

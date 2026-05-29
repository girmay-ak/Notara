# Notara — V1 Requirements & Feature Plan

What we build for the first real version, the features it includes, and the order
to build them. Consistent with [`STACK.md`](STACK.md) (lean stack) and
[`VALIDATION-PLAN.md`](VALIDATION-PLAN.md) (build order).

## Two versions, one codebase

| | **v0.1 — Validation prototype** | **v1.0 — Paid MVP** |
|---|---|---|
| Goal | Prove physios will use it (Rung 1) | A stranger can sign up & pay (Rung 3) |
| Auth | None — shared password gate | Supabase email + password |
| Storage | Audio streamed, not stored | Supabase Storage + history |
| Patients | No | Yes (pseudonymous) |
| Billing | No (sell by hand, Rung 2) | Stripe trial + subscription |
| Effort | ~1 week | ~5–6 weeks |
| Ships when | Note quality passes physio review | v0.1 validated + 5 pre-sales |

> **Build v0.1 first.** It's a strict subset of v1.0 — nothing is throwaway. The
> record→transcribe→note→copy loop is identical; v1.0 just adds accounts, history
> and billing around it.

---

## Scope of v1.0 (the "one thing on Vercel": Next.js + Supabase + Stripe)

### In scope
The full loop a paying solo physiotherapist needs: sign up → record → get a
KNGF/SOEP or SOAP note → copy into EPD → manage patients & history → pay.

### Out of scope (deferred — do NOT build in v1)
Native mobile app · EPD/Intramed direct integration · multi-therapist practices ·
Resend branded emails · Sentry · Plausible · Drizzle · Upstash · custom AI
training · note sharing/collaboration · admin dashboard · multiple languages
beyond NL/EN.

---

## Features & requirements

Priority: **M** = must (v1 blocker), **S** = should, **C** = could.
✅ = already built (Rung 0).

### Epic A — Account & Auth
| ID | Feature | Pri | Requirements |
|---|---|---|---|
| A1 | Sign up | M | Email + password (≥10 chars), profession, preferred language. Creates `profiles` + trialing `subscriptions` row via DB trigger. |
| A2 | Email verification | M | Mandatory before app access (clinical audit trail). Supabase confirm-email ON. |
| A3 | Log in / out | M | Email+password; magic-link secondary. |
| A4 | Password reset | M | Email link → set new password via `/auth/callback`. |
| A5 | Route protection | M | Middleware guards `(app)/*`; uses `getUser()` (not getSession). RLS = second line. |

### Epic B — Recording & AI note (the core loop)
| ID | Feature | Pri | Requirements |
|---|---|---|---|
| B0 | AI pipeline | ✅ | Whisper → Claude → zod-validated note. Done in `lib/ai/`. |
| B1 | Mic permission gate | M | Pre-prompt explaining *why*; handle `NotAllowedError` with browser-specific help. |
| B2 | Record audio | M | `MediaRecorder` mime cascade (webm/opus → mp4 for iOS); 10–90s; live timer + waveform; stop/cancel. |
| B3 | Upload | M | Direct browser → Supabase Storage signed-upload URL (avoids 4.5MB action limit). v0.1: POST blob to route handler, no storage. |
| B4 | Process | M | Route handler orchestrates the pipeline (✅). Cost/tokens logged to the note row. |
| B5 | Progress UI | M | 4 steps: Uploading → Transcribing → Structuring → Done. Poll `/api/notes/[id]` or Supabase Realtime. |
| B6 | Result screen | M | KNGF & SOAP renderers; per-section **Kopieer** + **Kopieer alles**; edit-in-place (save on blur). "Controleer voor opslag in EPD" banner. |
| B7 | Error & fallback | M | Every error code → human message; retry; on `claude_invalid_json` show transcript in editable textarea. |
| B8 | Format selection | S | Auto (physio+nl → KNGF, else SOAP) + manual override persisted per user. |

### Epic C — Data & history
| ID | Feature | Pri | Requirements |
|---|---|---|---|
| C1 | Notes list | M | User's notes, newest first; filter by date/format; pagination via URL state. |
| C2 | Note detail | M | View a saved note; editable while fresh, read-only after 24h (encourages paste-to-EPD discipline). |
| C3 | Patients | **v1.1** | *Deferred.* Pseudonymous (display_name like "Mw. Jansen 1972"; **no DOB/BSN**). Create/edit/archive. Notes table keeps a nullable `patient_id` so this drops in cleanly later. |
| C4 | Link note ↔ patient | **v1.1** | *Deferred.* Optional patient selection on the record screen. |

### Epic D — Billing & trial
| ID | Feature | Pri | Requirements |
|---|---|---|---|
| D1 | 14-day trial | M | **Card-free** (decided): enforced in-app, no card upfront. Set on signup. Watch conversion — A/B test card-required only if <5% at ~50 users. |
| D2 | Checkout | M | Stripe Checkout (hosted), monthly €29 / annual €249, Stripe Tax (BTW 21% incl.), locale nl. |
| D3 | Webhook sync | M | Raw-body, signature-verified; handle checkout.session.completed, subscription.created/updated/deleted, invoice.payment_succeeded/failed. Idempotency via `stripe_events`. |
| D4 | Customer Portal | M | Cancel / update card / invoices. |
| D5 | Trial enforcement | M | After trial/cancel/past_due, lock write paths → `/trial-ended`; read access 30 days. |
| D6 | Trial reminder emails | C | Day 10 + 13 via Vercel cron. Defer if Resend not in yet. |

### Epic E — Settings
| ID | Feature | Pri | Requirements |
|---|---|---|---|
| E1 | Profile | M | Name, profession, practice name. |
| E2 | Preferences | M | Preferred language + default note format. |
| E3 | Password change | S | From settings. |

### Epic F — Compliance & trust
| ID | Feature | Pri | Requirements |
|---|---|---|---|
| F1 | Legal pages | M | Privacy, Terms, DPA (BoZ model), `/subprocessors`. Placeholder copy → lawyer review before public launch. |
| F2 | Data export (Art. 20) | S | ZIP of profile/patients/notes/audit via signed URL. |
| F3 | Account deletion (Art. 17) | M | Type-to-confirm → admin deleteUser (cascade) + Stripe cancel/delete. |
| F4 | Audit log | S | `audit_log` table + `lib/audit.ts` helper on sensitive writes. |
| F5 | Audio deletion | M | Delete storage object within 60s of transcription. |
| F6 | Security headers | M | CSP, HSTS, X-Frame-Options DENY, Permissions-Policy (microphone=self), nosniff. |

### Epic G — Marketing & shell
| ID | Feature | Pri | Requirements |
|---|---|---|---|
| G1 | Landing page | M | Hero, "Hoe werkt het?", pricing, "Veilig & AVG-proof", FAQ, footer. NL primary + EN. |
| G2 | App shell | M | Desktop sidebar + topbar; mobile bottom nav (Dashboard/Record/Patients/Settings); 96px record FAB. |
| G3 | i18n | M | `lib/i18n/{nl,en}.ts`; NL primary; no hardcoded copy. |
| G4 | Design system | M | Brand tokens (forest green `#1F4D3D`), Inter, shadcn/ui (New York), Lucide. |
| G5 | Empty/loading/error states | S | Consistent across screens (Skeleton, line-art empty states, Alert errors). |
| G6 | Dark mode | C | system default + toggle. |

---

## Non-functional requirements

- **Privacy/GDPR:** EU region (Frankfurt); audio deleted ≤60s; no PII in notes
  (prompt-enforced + reviewed); RLS on every table.
- **Security:** RLS per-operation policies, `user_id` indexed; service role never
  client-reachable; zod on all external input; no `dangerouslySetInnerHTML` on notes.
- **Performance:** note returned in <12s p95; landing Lighthouse ≥90.
- **Responsive:** mobile-first; iOS Safari ≥14.3 (mime cascade, gesture-gated,
  background-pause warning); touch targets ≥44px.
- **i18n:** NL primary, EN mirror; dates via `Intl.DateTimeFormat` + locale; money
  in cents.
- **Reliability:** one corrective retry on invalid model output, then `failed`
  + keep transcript; webhook idempotency + daily reconcile.

## Data model
Defined in [`BLUEPRINT.md` §3](BLUEPRINT.md): `profiles`, `patients`, `notes`,
`subscriptions`, `audit_log`, `stripe_events`, storage bucket `audio`. All RLS-on,
per-operation policies, `user_id` indexed. Apply via Supabase migrations.

---

## Milestones (validation-first order)

| # | Milestone | Delivers | Gate / "Done =" |
|---|---|---|---|
| **M0** | Note-quality gate ⟵ now | `npm run eval` + physio review of 20 outputs | Physio: "trustworthy, light edits." **Hard gate — don't build UI until passed.** |
| **M1** | v0.1 prototype | Password gate + record→note→copy single page, deployed to Vercel | 3–5 physios use a live URL; ≥3 want it weekly |
| **M2** | Foundation | Supabase project + schema + RLS; auth (A1–A5); app shell (G2–G4); i18n (G3); landing (G1) | Real user signs up, verifies, sees dashboard |
| **M3** | Core loop in-app | B1–B8 wired to Storage + DB; notes saved | End-to-end on Chrome + iPhone Safari |
| **M4** | History & settings | C1–C2; settings E1–E3 | A user can browse & manage their notes (patients deferred to v1.1) |
| **M5** | Billing | D1–D5; security headers F6; audio deletion F5 | A stranger can pay €29 |
| **M6** | Compliance & launch | F1–F4; legal review; empty/error states; a11y pass | Public soft launch |

> Between M1 and M2 sits **Rung 2** of the validation plan: sell 5 annual subs by
> hand (Stripe Payment Link). Only start M2 once those 5 yes's exist.

## Definition of done — v1.0
A stranger can: sign up → verify email → record a 60–90s memo → receive a valid
KNGF/SOEP or SOAP note → edit & copy it → manage patients and history → start a
14-day trial → pay €29/mo or €249/yr → cancel via the portal. All data is
RLS-protected, audio is deleted after transcription, and the privacy/terms/DPA/
subprocessor pages are published (lawyer-reviewed).

## Decisions (resolved)
1. **Trial:** ✅ **Card-free.** No card upfront; monitor conversion.
2. **Patients (Epic C3/C4):** ✅ **Deferred to v1.1.** v1.0 ships notes-only history. `notes.patient_id` stays nullable so it slots in later with no migration pain.
3. **Dark mode (G6):** ✅ **Later** (post-launch).
4. **Email:** ✅ Supabase default emails for v1.0; add Resend post-launch.

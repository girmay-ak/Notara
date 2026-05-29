# Notara v0.1 — Validation Prototype Spec (M1)

Build-ready spec for the thinnest real product: **record → transcribe → note →
copy**, password-gated, on Vercel. No accounts, no database, no billing, no
patients. Goal: put it in front of 3–5 physios and learn if they'll use it
(Rung 1). Reuses the existing `lib/ai/` pipeline unchanged.

> **Gate before this:** M0 note-quality passes physio review (`npm run eval`).

## Non-goals (do NOT add here)
Auth/Supabase, persistence, history, patients, Stripe, email, analytics, dark
mode, multi-page nav. Everything is one screen behind one shared password.

## Architecture

```
app/
  layout.tsx                 # exists — add Tailwind + Inter
  page.tsx                   # redirect → /record (or render gate)
  gate/page.tsx              # password entry (server action sets cookie)
  record/page.tsx            # the one screen (Server Component shell)
  api/notes/route.ts         # exists — add gate check (reject if no cookie)
components/features/recording/
  PermissionGate.tsx         # mic permission pre-prompt + denied help
  RecordButton.tsx           # mic button, states
  Waveform.tsx               # live canvas waveform
  useRecorder.ts             # MediaRecorder state machine (client hook)
components/features/notes/
  NoteResult.tsx             # renders KngfNote/SoapNote sections
  CopyButton.tsx             # per-section + copy-all
  ProgressSteps.tsx          # Uploading → Transcribing → Structuring → Done
lib/
  gate.ts                    # check/set the prototype password cookie
  i18n.ts                    # minimal nl/en strings (seed of lib/i18n/)
middleware.ts                # redirect unauthenticated → /gate
```

## The password gate (stand-in for auth)
- Env `PROTOTYPE_PASSWORD`. `/gate` has one input + a server action that compares
  (constant-time) and, on match, sets an httpOnly `notara_gate` cookie
  (signed/opaque value, `SameSite=Lax`, 30-day expiry).
- `middleware.ts` redirects any route except `/gate` and static assets to `/gate`
  when the cookie is absent.
- `/api/notes` also checks the cookie and returns 401 `gate_required` if missing
  (so the API isn't open even though it's "just a prototype").

## API contract (existing route, one addition)
`POST /api/notes` — `multipart/form-data`:
- `audio` (File, required), `format` (`kngf`|`soap`), `language` (`nl`|`en`),
  `profession` (string).
- **200** → `{ ok: true, data: { transcript, content, renderedText, format,
  inputTokens, outputTokens } }`
- **422** → `{ ok: false, error: { code, message } }` (whisper/claude failures;
  show `message`, offer retry; on `claude_invalid_json` show editable transcript)
- **401** → `{ ok: false, error: { code: "gate_required" } }`
- Add `runtime="nodejs"` (set), bump `maxDuration` to 120–300 on Vercel Pro.

For v0.1 the browser **POSTs the blob directly** to this route (no Supabase
Storage) — audio is consumed in-memory and never persisted.

## `useRecorder` state machine (client)
States: `idle → permission → recording → stopping → uploading → transcribing →
structuring → done | error`.
Requirements:
- Mime cascade via `MediaRecorder.isTypeSupported`: `audio/webm;codecs=opus` →
  `audio/mp4` → `audio/ogg`. Pick matching file extension for the upload.
- `audioBitsPerSecond: 32000` only when webm/opus selected.
- `getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })`.
- Min 10s, max 90s (auto-stop at 90 with `recording_too_long` toast). Live timer.
- RMS amplitude check on stop → if too quiet, warn `audio_too_soft` before upload.
- `visibilitychange` while recording (iOS backgrounding) → warn, offer restart.
- Refuse on iOS <14.3 / unsupported MediaRecorder with a clear message.
- Errors mapped to codes: `mic_denied`, `mic_unavailable`, `recording_too_short`,
  `network_offline`, `upload_failed`, plus pipeline codes from the API.

## Screen flow (`/record`)
1. **Idle:** H1 "Spreek je notitie in" + sub; format toggle (KNGF/SOEP ↔ SOAP) and
   language (NL/EN); big mic button.
2. **Permission:** pre-prompt explaining why mic is needed → request.
3. **Recording:** timer + live waveform + Stop button; pulse animation.
4. **Processing:** `ProgressSteps` (Uploading → Transcribing → Structuring → Done).
5. **Done:** `NoteResult` — section cards, per-section Copy + "Kopieer alles",
   edit-in-place (contentEditable, local only — not persisted in v0.1), a
   prominent "Controleer voor opslag in EPD" banner, and "Opnieuw opnemen".
6. **Error:** Alert with the human message + Retry; `claude_invalid_json` shows the
   raw transcript in an editable textarea as fallback.

## Styling / design
- Add **Tailwind v4** + **shadcn/ui** (New York) + **Lucide** now (reused in v1.0).
- Brand token `--brand-700: #1F4D3D`; Inter via `next/font`.
- Mobile-first: single column, 96px circular record button, ≥44px targets.

## i18n
- Seed `lib/i18n.ts` with NL (primary) + EN for every visible string and error
  code. No hardcoded copy — this becomes `lib/i18n/{nl,en}.ts` in v1.0.

## Environment (Vercel project settings)
```
ANTHROPIC_API_KEY      # Claude
OPENAI_API_KEY         # Whisper
PROTOTYPE_PASSWORD     # the shared gate password
```
Deploy region: fra1 (Frankfurt). Function `maxDuration` 120–300 (Pro).

## Acceptance criteria
- [ ] Visiting any route without the cookie redirects to `/gate`; correct password
      grants access; wrong password is rejected.
- [ ] On Chrome desktop + iPhone Safari: record 30–60s of Dutch → a valid KNGF
      note renders within ~12s.
- [ ] "Kopieer alles" puts the rendered note on the clipboard; toast confirms.
- [ ] Denying mic shows browser-specific help, not a crash.
- [ ] A forced Whisper/Claude error shows a friendly message + working Retry.
- [ ] No audio is persisted anywhere; nothing is written to a database.
- [ ] All visible text comes from `lib/i18n.ts` (NL default).

## Build order (tasks)
1. Tailwind + shadcn + Inter + brand token; `app/layout.tsx`.
2. `lib/gate.ts` + `/gate` page + server action + `middleware.ts` + API 401 check.
3. `useRecorder.ts` (the riskiest part — build + test on a real iPhone early).
4. `RecordButton` + `Waveform` + `PermissionGate`.
5. Wire POST to `/api/notes`; `ProgressSteps`.
6. `NoteResult` + `CopyButton` + edit-in-place + EPD banner.
7. Error states + `lib/i18n.ts`.
8. Deploy to Vercel; real-device test matrix (Chrome, iOS Safari, Android Chrome).

## After v0.1 ships
Run **Rung 2** (sell 5 annual subs via a Stripe Payment Link). Only then begin
M2 (Supabase schema + auth) toward the v1.0 paid MVP.

# Notara — Validation Plan (do this BEFORE the 6-week build)

The blueprint is a great *production* plan. But before spending 6 weeks, we
answer three questions — in order. The tech is not the risk; these are:

1. **Quality** — Is the KNGF/SOEP note good enough that a real physiotherapist
   *trusts* it and pastes it into their EPD without heavy editing? **(If this
   fails, nothing else matters. Stop here.)**
2. **Workflow** — Will they actually *speak* a memo instead of typing?
3. **Willingness to pay** — Will they pay ~€29/mo / €249/yr?

## The ladder — climb one rung at a time

### Rung 0 — AI pipeline in isolation (days) ⟵ we are here
No UI. Pure functions + an eval script.
- `npm run eval` runs sample Dutch transcripts through Claude → structured KNGF
  JSON. (Whisper step wired but text fixtures let us test note quality with only
  an Anthropic key.)
- **Exit test:** a working physiotherapist grades 20 outputs. We want
  "trustworthy, light edits only." Iterate on the prompt until yes.
- **If no:** the product doesn't exist yet. Keep tuning prompts; do not build UI.

### Rung 1 — One Vercel page (~1 week)
The thinnest real product. **No accounts, no patients, no billing.**
- Single page: record button → upload → transcribe → note → copy buttons.
- Password-gate it (one shared password env var).
- Hand it to **3–5 real physios**. Watch them use it (call/screen-share).
- **Exit test:** ≥3 of 5 say "I'd use this weekly" *and* actually generate
  multiple notes unprompted over a week.

### Rung 2 — Sell 5 by hand (days)
Before building auth/DB/Stripe properly:
- Put up a **Stripe Payment Link** for €249/yr.
- Ask the engaged physios from Rung 1 to pre-pay (offer a founder discount).
- **Exit test (the real one):** **5 paid yes's.** Your own blueprint §17 says
  it: "If you can't get 5 yes's at €249/yr, the price isn't the issue — find out
  fast."

### Rung 3 — Build the validated MVP (the 6-week plan)
Only now is the full build justified. Follow the blueprint's week-by-week plan,
on the **lean stack** in [`STACK.md`](STACK.md) (Vercel + Supabase + Stripe, no
AWS). Add auth, persistence, patients, real Stripe subscriptions, GDPR docs.

## What we are deliberately NOT doing during validation

Native mobile, EPD direct integration, multi-therapist practices, Sentry,
Plausible, Resend, AWS Lambda, custom AI training, dark mode polish, 40+ error
strings, full GDPR doc set. All of it waits for a "yes" from Rung 2.

## Highest-leverage QA (from the blueprint, restated)

Have a **practicing physiotherapist review the KNGF prompt and 20 sample
outputs** before any public use. This is cheap and decisive. Everything else is
secondary.

## Definition of done per rung

| Rung | Done when |
|---|---|
| 0 | `npm run eval` produces valid KNGF/SOAP JSON; physio grades quality acceptable |
| 1 | 5 physios used a live Vercel URL; ≥3 want it weekly |
| 2 | 5 people paid (or firmly pre-committed) at €249/yr |
| 3 | Strangers can sign up, record, get a note, and pay — the blueprint MVP |

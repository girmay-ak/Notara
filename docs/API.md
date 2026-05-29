# Notara — Backend & API Architecture (mobile-ready)

The backend is **Next.js route handlers + `lib/` business logic on Vercel**, with
**Supabase** for data/auth/storage. One language (TypeScript), one deploy. It is
designed so a **future mobile app (React Native/Expo) reuses the same backend**
without a rewrite.

## Principles (so web + mobile share one backend)

1. **Logic lives in `lib/`, framework-agnostic.** `lib/ai/`, future
   `lib/notes/`, etc. are pure functions. Route handlers and server actions only
   orchestrate. A mobile app never imports these — it calls the HTTP API that
   wraps them.
2. **The contract is HTTP route handlers under `/api`** returning the stable
   discriminated union `{ ok: true, data } | { ok: false, error: { code, message } }`
   (see `lib/ai/result.ts`). Anything a mobile app needs must be reachable as an
   endpoint — **not** a server action (server actions are web/RSC-only).
   - Server actions are fine for *web-only form* niceties, but never the sole
     path to a capability mobile will need.
3. **Auth is token-agnostic.** `lib/supabase/auth.ts` resolves the user from
   **either** the session cookie (web) **or** an `Authorization: Bearer <jwt>`
   header (mobile). Same endpoints serve both clients.
4. **Supabase Auth + RLS is the shared backbone.** Both clients authenticate
   with Supabase Auth (JWT). For plain data CRUD, mobile can talk **directly to
   Supabase** (RLS enforces ownership) — no bespoke endpoints needed. Custom
   endpoints are only for things that need server secrets (the AI pipeline,
   Stripe).
5. **Stable, versionable surface.** Endpoints return typed JSON; breaking changes
   would move under `/api/v2/...`. Keep response shapes stable.
6. **No browser-only assumptions in endpoints.** Don't rely on cookies-only or
   CORS-only behaviour; native apps send Bearer tokens and don't need CORS.

## Current endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/notes` | POST (multipart) | cookie **or** Bearer | Audio → Whisper → Claude → structured note |

Planned: `GET /api/notes`, `GET /api/notes/[id]` (or mobile reads these straight
from Supabase via RLS), `POST /api/stripe/checkout`, `POST /api/stripe/webhook`.

## What mobile will reuse vs. rebuild

| Concern | Web | Mobile (future) |
|---|---|---|
| Auth | Supabase Auth (cookies) | Supabase Auth (JWT) — same project |
| Data CRUD | supabase-js + RLS | supabase-js/native + RLS — **same rules** |
| AI pipeline | `POST /api/notes` (cookie) | `POST /api/notes` (Bearer) — **same endpoint** |
| Billing | Stripe Checkout (web) | Stripe via the same API + RevenueCat if needed |
| Business logic | `lib/` | not reused directly — consumed via the API |

Rebuilt for mobile: only the **UI layer** (React Native screens). The backend and
data rules are shared.

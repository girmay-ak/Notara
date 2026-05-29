/**
 * Public Supabase connection config.
 *
 * These are PUBLIC values (shipped in the browser bundle, protected by RLS).
 * We fall back to literals so the app works even if a Vercel env var is set to
 * an empty/wrong value (Vercel env overrides .env files at build time, and an
 * empty `NEXT_PUBLIC_SUPABASE_URL` was breaking the browser client).
 *
 * Secrets (service-role, AI, Stripe) are NEVER given fallbacks here.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://enqaxzkvpbjkypfaxbzg.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_1MGe_aThkiCO11GOyDhsbw_t72pMNjC";

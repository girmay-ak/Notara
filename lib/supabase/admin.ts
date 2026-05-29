import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Service-role client — **bypasses RLS**. Server-only. Use ONLY for privileged
 * operations that legitimately act outside a user session:
 *   - the Stripe webhook (writes `subscriptions`, `stripe_events`)
 *   - deleting audio objects after transcription
 *   - writing the append-only `audit_log`
 *
 * NEVER import this into a Client Component or expose it via a client-reachable
 * route without an explicit authorization check first. The `server-only` import
 * makes a client bundle fail the build if this leaks.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

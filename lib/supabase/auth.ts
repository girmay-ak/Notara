import { createServerClient as createSSRClient } from "@supabase/ssr";
import { createClient as createJsClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import { createClient as createCookieClient } from "./server";
import type { Database } from "./database.types";

/**
 * Resolve the authenticated user for a **route handler**, accepting EITHER:
 *  - an `Authorization: Bearer <jwt>` header (mobile / API clients), or
 *  - the Supabase session cookie (web).
 *
 * This is what makes the API reusable by a future mobile app without a second
 * auth path. Returns the verified user or `null`. Always verifies the JWT with
 * Supabase (never trusts it blindly).
 */
export async function getUserFromRequest(request: Request): Promise<User | null> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    const supabase = createJsClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data, error } = await supabase.auth.getUser(token);
    return error ? null : data.user;
  }

  // Fall back to the cookie-based session (web).
  const supabase = await createCookieClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

/**
 * Resolve the authenticated user in a **Server Component or Server Action**
 * (cookie session only). Use `getUser()` semantics (verified), never
 * `getSession()`.
 */
export async function getSessionUser(): Promise<User | null> {
  const supabase = await createCookieClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}

// Re-export so callers don't need a separate import for the SSR factory.
export { createSSRClient };

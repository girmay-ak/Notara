import { createServerClient as createSSRClient } from "@supabase/ssr";
import { createClient as createJsClient } from "@supabase/supabase-js";
import type { SupabaseClient, User } from "@supabase/supabase-js";
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

export interface AuthedContext {
  user: User;
  /** RLS-scoped client for the authenticated user (cookie or bearer). */
  supabase: SupabaseClient<Database>;
}

/**
 * Like `getUserFromRequest`, but also returns an RLS-scoped Supabase client so a
 * route handler can read/write as the user — cookie (web) or Bearer (mobile).
 * This keeps persistence in the endpoint, so a mobile client gets saved notes
 * from the same call. Returns `null` when unauthenticated.
 */
export async function getAuthedContext(
  request: Request,
): Promise<AuthedContext | null> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice("Bearer ".length).trim();
    const supabase = createJsClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { autoRefreshToken: false, persistSession: false },
      },
    );
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return null;
    return {
      user: data.user,
      supabase: supabase as unknown as SupabaseClient<Database>,
    };
  }

  const supabase = await createCookieClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    user: data.user,
    supabase: supabase as unknown as SupabaseClient<Database>,
  };
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

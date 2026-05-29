import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Supabase client for **Server Components, Server Actions and Route Handlers**.
 * Reads/writes the auth cookies so the session refreshes. RLS-aware (anon key +
 * the user's session). Always `await` it (Next 15 `cookies()` is async).
 *
 * Authorization rule: in RSC/actions verify the user with
 * `supabase.auth.getUser()` (not getSession()); RLS is the second line.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          // Called from a Server Component (read-only cookies) → ignore.
          // Token refresh is handled in middleware.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* no-op in RSC */
          }
        },
      },
    },
  );
}

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";

const APP_PREFIXES = ["/dashboard", "/record", "/notes", "/settings"];
const AUTH_PREFIXES = ["/login", "/signup", "/reset"];

/**
 * Refreshes the Supabase session on every request and gates routes:
 *  - unauthenticated users hitting an app route → /login
 *  - authenticated users hitting an auth route → /dashboard
 * RLS + per-page getUser() are the second line of defence.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const inApp = APP_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  const inAuth = AUTH_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));

  if (!user && inApp) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (user && inAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

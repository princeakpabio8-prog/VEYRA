/**
 * Supabase server client.
 *
 * Use this in Server Components, Server Actions, and Route Handlers.
 * Reads cookies via Next.js `cookies()` to forward the user session.
 * Never exposed to the browser.
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

type CookieEntry = { name: string; value: string; options: Record<string, unknown> };

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieEntry[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookie mutations are ignored safely.
          }
        },
      },
    }
  );
}

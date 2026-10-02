/**
 * Supabase browser client.
 *
 * Use this in Client Components and browser-side code.
 * Reads NEXT_PUBLIC_* env vars — safe to expose to the browser.
 */
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

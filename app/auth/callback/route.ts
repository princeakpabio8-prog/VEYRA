/**
 * Stub Supabase auth callback route.
 *
 * Supabase Auth redirects here after email confirmation and OAuth flows.
 * Exchanges the one-time `code` for a session cookie, then redirects
 * the user to their intended destination (or /dashboard by default).
 *
 * Reference: https://supabase.com/docs/guides/auth/server-side/nextjs
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — send to login with error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

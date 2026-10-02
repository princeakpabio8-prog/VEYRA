/**
 * Auth helpers — thin wrappers around Supabase Auth for server-side use.
 *
 * Import in Server Components and Server Actions.
 * Never import in Client Components — use the browser client directly there.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/types";

/**
 * Returns the current authenticated user, or null if not signed in.
 * Does NOT redirect — use requireUser() for protected pages.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    createdAt: user.created_at,
  };
}

/**
 * Returns the current user or redirects to /login.
 * Use at the top of any protected Server Component or Server Action.
 */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

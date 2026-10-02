/**
 * /login — placeholder page.
 * Replace with a real sign-in form when building the auth flow.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-surface-border bg-ivory p-8 shadow-card">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Sign in to VEYRA</h1>

        {params.error && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            Authentication failed. Please try again.
          </p>
        )}

        <p className="text-sm text-ink-secondary">
          Auth UI will be built here. Connect your Supabase project and implement
          the sign-in form using <code className="font-mono text-xs">supabase.auth.signInWithOtp()</code> or OAuth.
        </p>
      </div>
    </main>
  );
}

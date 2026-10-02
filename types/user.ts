// ─── User & Profile ──────────────────────────────────────────────────────────
// Mirrors Supabase Auth users + an extended public profile.

export interface User {
  id: string;           // UUID — matches auth.users.id
  email: string;
  createdAt: string;    // ISO-8601
}

export interface Profile {
  id: string;           // FK → users.id
  displayName: string;
  avatarUrl: string | null;
  companyName: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "owner" | "admin" | "member";

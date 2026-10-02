# VEYRA

**Premium marketplace for AI employees.**

> Find an AI employee → Try it → Deploy it → Put it to work.

---

## Architecture overview

```
app/                    Next.js App Router pages & layouts
components/
  ui/                   Design-system primitives (Button, Card, Badge …)
lib/
  supabase/             Supabase browser + server clients, DB type stubs
  voice/                Voice provider abstraction (interface + factory)
  utils.ts              cn() and shared utilities
types/                  TypeScript domain types (no runtime code)
supabase/
  migrations/           SQL schema migrations + seed data
public/                 Static assets
```

---

## Core domain model

| Type | Description |
|---|---|
| `User` | Auth identity — mirrors `auth.users` |
| `Profile` | Public-facing user profile, role, company |
| `Agent` | A reusable marketplace product definition |
| `AgentCapability` | What an agent can do (listed features) |
| `Deployment` | A customer's configured live instance of an agent |
| `Call` | A single voice or conversation session |
| `UsageRecord` | Metered billing event (tokens, seconds, etc.) |
| `Review` | Marketplace rating left by a tenant |
| `Integration` | Authorised third-party tool connected by a tenant |

### Key distinctions

- **Agent ≠ Deployment.** An agent is a reusable product. A deployment is a customer's configured running instance.  
- Agents are **data-driven** rows in the `agents` table. No agent is hard-coded into UI logic.
- Tenants are isolated by `tenant_id` + Row-Level Security on every table.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 15, App Router, TypeScript |
| Styling | Tailwind CSS, custom design tokens |
| UI primitives | Hand-rolled (shadcn/ui can be added selectively) |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Deployment | Vercel |

---

## Voice provider abstraction

All voice infrastructure is accessed through the `VoiceProvider` interface in [`lib/voice/types.ts`](lib/voice/types.ts).

Switch providers by setting `VOICE_PROVIDER` in `.env.local`:

```
VOICE_PROVIDER=vapi   # vapi | twilio | retell
```

To add a new provider, create `lib/voice/providers/<name>.ts` implementing `VoiceProvider`, then add a case to [`lib/voice/index.ts`](lib/voice/index.ts). No other file changes required.

---

## Database

Schema migrations live in [`supabase/migrations/`](supabase/migrations/).

Apply them:

```bash
# Via Supabase CLI
supabase db push

# Or paste directly into Supabase Dashboard > SQL Editor
```

Generate typed DB client after schema changes:

```bash
npx supabase gen types typescript --project-id <your-project-ref> \
  > lib/supabase/database.types.ts
```

Row-Level Security is **enabled on every table** from the start. Tenant isolation is enforced at the DB layer, not just in application code.

---

## Environment setup

```bash
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

See [`.env.local.example`](.env.local.example) for the full variable list.

---

## Getting started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Design system

Tokens are defined in two places that stay in sync:

- **[`tailwind.config.ts`](tailwind.config.ts)** — Tailwind utility classes (`bg-brand-500`, `text-ink-secondary` …)
- **[`app/globals.css`](app/globals.css)** — CSS custom properties for use in plain CSS

### Colour palette

| Token | Usage |
|---|---|
| `brand-500` `#4255ff` | Primary actions, links |
| `surface` / `surface-muted` / `surface-subtle` | Page and card backgrounds |
| `surface-border` | Dividers, borders |
| `ink` | Primary text |
| `ink-secondary` | Supporting text |
| `ink-tertiary` | Placeholders, disabled labels |

### Primitive components

| Component | File |
|---|---|
| `Button` | `components/ui/Button.tsx` |
| `Card` / `CardHeader` / `CardTitle` / `CardDescription` / `CardFooter` | `components/ui/Card.tsx` |
| `Badge` | `components/ui/Badge.tsx` |

---

## Project principles

1. **Simplicity first** — fewer moving parts, fewer bugs.
2. **Agents are data** — no agent is hard-coded in UI logic.
3. **Tenant isolation from day one** — enforced at the DB layer with RLS.
4. **Voice is abstracted** — swap providers without touching business logic.
5. **No fake APIs** — if it doesn't work, it isn't there.

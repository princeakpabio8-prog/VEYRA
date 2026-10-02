-- ─── VEYRA initial schema ─────────────────────────────────────────────────────
-- Apply via Supabase Dashboard > SQL Editor, or supabase db push.
-- All tables live in the public schema with Row-Level Security enabled.
-- Tenant isolation is enforced by the tenant_id column + RLS policies.

-- ────────────────────────────────────────────────────────────────────────────
-- Extensions
-- ────────────────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────────────────────
-- Profiles (extends auth.users)
-- ────────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  display_name    text not null default '',
  avatar_url      text,
  company_name    text,
  role            text not null default 'member'
                  check (role in ('owner', 'admin', 'member')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: user can read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: user can update own"
  on public.profiles for update
  using (auth.uid() = id);

-- ────────────────────────────────────────────────────────────────────────────
-- Agents (marketplace catalogue — data-driven, no hard-coded agent logic)
-- ────────────────────────────────────────────────────────────────────────────
create table public.agents (
  id                      uuid primary key default uuid_generate_v4(),
  slug                    text unique not null,
  name                    text not null,
  tagline                 text not null default '',
  description             text not null default '',
  avatar_url              text,
  category                text not null default 'general',
  pricing_model           text not null default 'per_seat'
                          check (pricing_model in ('per_seat','per_usage','flat','free')),
  base_monthly_price_usd  numeric(10,2),
  status                  text not null default 'active'
                          check (status in ('active','beta','coming_soon','deprecated')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Agents are publicly readable (marketplace catalogue)
alter table public.agents enable row level security;
create policy "agents: public read" on public.agents for select using (true);

-- ────────────────────────────────────────────────────────────────────────────
-- Agent capabilities
-- ────────────────────────────────────────────────────────────────────────────
create table public.agent_capabilities (
  id          uuid primary key default uuid_generate_v4(),
  agent_id    uuid not null references public.agents(id) on delete cascade,
  name        text not null,
  description text not null default '',
  icon        text,
  created_at  timestamptz not null default now()
);

alter table public.agent_capabilities enable row level security;
create policy "agent_capabilities: public read"
  on public.agent_capabilities for select using (true);

-- ────────────────────────────────────────────────────────────────────────────
-- Deployments (customer's configured instance of an agent)
-- ────────────────────────────────────────────────────────────────────────────
create table public.deployments (
  id                    uuid primary key default uuid_generate_v4(),
  tenant_id             uuid not null,  -- future: FK → tenants table
  agent_id              uuid not null references public.agents(id),
  name                  text not null,
  config                jsonb not null default '{}',
  status                text not null default 'draft'
                        check (status in ('draft','active','paused','decommissioned')),
  voice_provider_id     text,
  external_callback_url text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.deployments enable row level security;
create policy "deployments: tenant isolation"
  on public.deployments for all
  using (tenant_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- Calls
-- ────────────────────────────────────────────────────────────────────────────
create table public.calls (
  id                  uuid primary key default uuid_generate_v4(),
  deployment_id       uuid not null references public.deployments(id),
  tenant_id           uuid not null,
  caller_identifier   text,
  direction           text not null check (direction in ('inbound','outbound')),
  status              text not null default 'initiated'
                      check (status in ('initiated','ringing','in_progress','completed','failed','no_answer')),
  duration_seconds    integer,
  started_at          timestamptz,
  ended_at            timestamptz,
  recording_url       text,
  transcript_url      text,
  metadata            jsonb not null default '{}',
  created_at          timestamptz not null default now()
);

alter table public.calls enable row level security;
create policy "calls: tenant isolation"
  on public.calls for all
  using (tenant_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- Usage records
-- ────────────────────────────────────────────────────────────────────────────
create table public.usage_records (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null,
  deployment_id   uuid not null references public.deployments(id),
  call_id         uuid references public.calls(id),
  metric_type     text not null
                  check (metric_type in ('call_duration','llm_tokens','tts_characters','stt_seconds','api_calls')),
  quantity        numeric not null,
  unit            text not null,
  recorded_at     timestamptz not null default now()
);

alter table public.usage_records enable row level security;
create policy "usage_records: tenant isolation"
  on public.usage_records for all
  using (tenant_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- Reviews
-- ────────────────────────────────────────────────────────────────────────────
create table public.reviews (
  id                uuid primary key default uuid_generate_v4(),
  agent_id          uuid not null references public.agents(id),
  tenant_id         uuid not null,
  author_id         uuid not null references public.profiles(id),
  rating            smallint not null check (rating between 1 and 5),
  title             text,
  body              text,
  verified_purchase boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.reviews enable row level security;
create policy "reviews: public read" on public.reviews for select using (true);
create policy "reviews: author write"
  on public.reviews for insert
  with check (author_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- Integrations
-- ────────────────────────────────────────────────────────────────────────────
create table public.integrations (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null,
  provider        text not null,
  display_name    text not null,
  status          text not null default 'active'
                  check (status in ('active','expired','revoked','error')),
  scopes          text[] not null default '{}',
  credential_ref  text not null,  -- server-side secret reference; never returned raw
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.integrations enable row level security;
create policy "integrations: tenant isolation"
  on public.integrations for all
  using (tenant_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- Data API grants
-- Required because "Automatically expose new tables in the API" is disabled.
-- RLS policies above still control which rows each role can see/touch.
-- ────────────────────────────────────────────────────────────────────────────

-- Schema visibility
grant usage on schema public to anon, authenticated;

-- Marketplace tables — public read (RLS policy: using (true))
grant select on public.agents               to anon, authenticated;
grant select on public.agent_capabilities   to anon, authenticated;
grant select on public.reviews              to anon, authenticated;

-- Authenticated-only tables (RLS enforces row/tenant ownership)
grant select, insert, update               on public.profiles       to authenticated;
grant select, insert, update, delete       on public.deployments    to authenticated;
grant select, insert, update, delete       on public.calls          to authenticated;
grant select, insert, update, delete       on public.usage_records  to authenticated;
grant select, insert                       on public.reviews        to authenticated;
grant select, insert, update, delete       on public.integrations   to authenticated;

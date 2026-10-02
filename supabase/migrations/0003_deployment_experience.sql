-- ─── VEYRA deployment experience schema ──────────────────────────────────────
-- Migration 0003: agent_tasks, agent_requests, support_requests
-- Apply after 0001 and 0002.
--
-- Design notes:
--   * agent_tasks uses a generic config/result JSONB so any future agent can
--     store its own structured input and output without table changes.
--   * agent_requests captures "Request an AI employee" submissions.
--   * support_requests captures "Get human help" submissions.
--   * All tables use tenant_id = auth.uid() RLS (same pattern as deployments).
-- ────────────────────────────────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────────────────────
-- agent_tasks
-- A single unit of work submitted to a deployed AI employee.
-- ────────────────────────────────────────────────────────────────────────────
create table public.agent_tasks (
  id              uuid primary key default uuid_generate_v4(),
  tenant_id       uuid not null,
  deployment_id   uuid not null references public.deployments(id) on delete cascade,
  -- Generic input payload — schema defined per-agent in the application layer
  input           jsonb not null default '{}',
  -- Execution status lifecycle
  status          text not null default 'queued'
                  check (status in ('queued','working','completed','failed')),
  -- Executor type: 'mock' | 'real' — always explicit, never assumed
  executor_type   text not null default 'mock'
                  check (executor_type in ('mock','real')),
  -- Structured result payload — schema defined per-agent in the application layer
  result          jsonb,
  -- Human-readable error message if status = 'failed'
  error_message   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.agent_tasks enable row level security;

create policy "agent_tasks: tenant isolation"
  on public.agent_tasks for all
  using (tenant_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- agent_requests
-- "Request an AI employee" — customer requests a new agent type.
-- ────────────────────────────────────────────────────────────────────────────
create table public.agent_requests (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  -- What should the AI employee do?
  request_description     text not null,
  -- What type of business/workflow is it for?
  business_workflow       text not null,
  -- Preferred interaction: 'voice' | 'text' | 'both'
  interaction_preference  text not null default 'both'
                          check (interaction_preference in ('voice','text','both')),
  -- Optional additional context
  additional_details      text,
  -- Processing status (handled by VEYRA team / future admin)
  status                  text not null default 'received'
                          check (status in ('received','reviewing','in_progress','completed','declined')),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table public.agent_requests enable row level security;

-- Users can read and insert their own requests; no self-update/delete for now
create policy "agent_requests: owner read"
  on public.agent_requests for select
  using (user_id = auth.uid());

create policy "agent_requests: owner insert"
  on public.agent_requests for insert
  with check (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- support_requests
-- "Get human help" — deployment assistance requests.
-- ────────────────────────────────────────────────────────────────────────────
create table public.support_requests (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  -- Optional FK — help may be requested in context of a deployment
  deployment_id   uuid references public.deployments(id) on delete set null,
  -- Optional agent context (slug, not FK — agent may not be deployed yet)
  agent_slug      text,
  -- Short description of what they need help with
  description     text not null,
  status          text not null default 'open'
                  check (status in ('open','in_progress','resolved','closed')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.support_requests enable row level security;

create policy "support_requests: owner read"
  on public.support_requests for select
  using (user_id = auth.uid());

create policy "support_requests: owner insert"
  on public.support_requests for insert
  with check (user_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- Grant API access (mirrors 0001 grant pattern)
-- ────────────────────────────────────────────────────────────────────────────
grant select, insert, update, delete on public.agent_tasks    to authenticated;
grant select, insert                 on public.agent_requests  to authenticated;
grant select, insert                 on public.support_requests to authenticated;

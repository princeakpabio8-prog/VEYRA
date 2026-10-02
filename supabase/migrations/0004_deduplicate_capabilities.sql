-- ─── Remove duplicate agent_capabilities rows ────────────────────────────────
-- Caused by running 0002_seed_agents.sql more than once before the idempotency
-- guards were added in that file.
--
-- Strategy: keep the single row with the lowest id (earliest insert) for each
-- (agent_id, name) pair and delete all later duplicates.
-- This is a no-op if no duplicates exist.

delete from public.agent_capabilities
where id not in (
  select min(id)
  from public.agent_capabilities
  group by agent_id, name
);

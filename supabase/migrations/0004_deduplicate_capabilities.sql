-- ─── Remove duplicate agent_capabilities rows (UUID-safe) ────────────────────
-- Caused by running 0002_seed_agents.sql more than once before the idempotency
-- guards were added in that file.
--
-- Uses ROW_NUMBER() partitioned by (agent_id, name) to identify duplicates
-- safely with UUID primary keys (MIN(id) is not meaningful for UUIDs).
-- Keeps the first row per partition; deletes all subsequent duplicates.
-- This is a no-op if no duplicates exist.

with ranked as (
  select
    id,
    row_number() over (
      partition by agent_id, name
      order by id
    ) as row_num
  from public.agent_capabilities
)
delete from public.agent_capabilities ac
using ranked r
where ac.id = r.id
  and r.row_num > 1;

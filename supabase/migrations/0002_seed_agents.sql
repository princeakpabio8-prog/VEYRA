-- Seed initial agents (Arclio, ProcureCall, Servexa)
-- Run after 0001_initial_schema.sql
--
-- IDEMPOTENT: safe to re-run. Agents use ON CONFLICT (slug) DO NOTHING.
-- Capabilities use NOT EXISTS guards on (agent_id, name) so re-running
-- never creates duplicate rows.

insert into public.agents (slug, name, tagline, description, category, pricing_model, base_monthly_price_usd, status)
values
  (
    'arclio',
    'Arclio',
    'Your AI business operator',
    'Arclio is a general-purpose AI business operator. Give it a business task and Arclio plans, executes, and reports the result using authorised tools and integrations.',
    'general',
    'per_seat',
    99.00,
    'active'
  ),
  (
    'procurecall',
    'ProcureCall',
    'AI-powered procurement representative',
    'ProcureCall handles supplier outreach, RFQ management, and procurement workflows end-to-end so your team can focus on strategy.',
    'procurement',
    'per_usage',
    null,
    'beta'
  ),
  (
    'servexa',
    'Servexa',
    'Business voice agent for customer service',
    'Servexa handles inbound and outbound voice calls for customer service, booking, and support — 24/7, with no wait times.',
    'voice',
    'per_usage',
    null,
    'beta'
  )
on conflict (slug) do nothing;

-- ─── Arclio capabilities ──────────────────────────────────────────────────────

insert into public.agent_capabilities (agent_id, name, description, icon)
select a.id, 'Task planning', 'Breaks complex business goals into executable steps', 'layout-list'
from public.agents a
where a.slug = 'arclio'
  and not exists (
    select 1 from public.agent_capabilities
    where agent_id = a.id and name = 'Task planning'
  );

insert into public.agent_capabilities (agent_id, name, description, icon)
select a.id, 'Tool execution', 'Calls authorised integrations on your behalf', 'zap'
from public.agents a
where a.slug = 'arclio'
  and not exists (
    select 1 from public.agent_capabilities
    where agent_id = a.id and name = 'Tool execution'
  );

insert into public.agent_capabilities (agent_id, name, description, icon)
select a.id, 'Progress reporting', 'Summarises what was done and what to review', 'file-text'
from public.agents a
where a.slug = 'arclio'
  and not exists (
    select 1 from public.agent_capabilities
    where agent_id = a.id and name = 'Progress reporting'
  );

-- ─── ProcureCall capabilities ─────────────────────────────────────────────────

insert into public.agent_capabilities (agent_id, name, description, icon)
select a.id, 'Supplier outreach', 'Contacts suppliers and collects quotes automatically', 'mail'
from public.agents a
where a.slug = 'procurecall'
  and not exists (
    select 1 from public.agent_capabilities
    where agent_id = a.id and name = 'Supplier outreach'
  );

insert into public.agent_capabilities (agent_id, name, description, icon)
select a.id, 'RFQ management', 'Creates and tracks requests for quotation', 'clipboard-list'
from public.agents a
where a.slug = 'procurecall'
  and not exists (
    select 1 from public.agent_capabilities
    where agent_id = a.id and name = 'RFQ management'
  );

-- ─── Servexa capabilities ─────────────────────────────────────────────────────

insert into public.agent_capabilities (agent_id, name, description, icon)
select a.id, 'Inbound calls', 'Handles inbound customer calls with natural voice', 'phone-incoming'
from public.agents a
where a.slug = 'servexa'
  and not exists (
    select 1 from public.agent_capabilities
    where agent_id = a.id and name = 'Inbound calls'
  );

insert into public.agent_capabilities (agent_id, name, description, icon)
select a.id, 'Outbound calls', 'Places outbound calls for follow-ups and reminders', 'phone-outgoing'
from public.agents a
where a.slug = 'servexa'
  and not exists (
    select 1 from public.agent_capabilities
    where agent_id = a.id and name = 'Outbound calls'
  );

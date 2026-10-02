-- Seed initial agents (Arclio, ProcureCall, Servexa)
-- Run after 0001_initial_schema.sql

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
  );

-- Arclio capabilities
insert into public.agent_capabilities (agent_id, name, description, icon)
select id, 'Task planning', 'Breaks complex business goals into executable steps', 'layout-list'
from public.agents where slug = 'arclio';

insert into public.agent_capabilities (agent_id, name, description, icon)
select id, 'Tool execution', 'Calls authorised integrations on your behalf', 'zap'
from public.agents where slug = 'arclio';

insert into public.agent_capabilities (agent_id, name, description, icon)
select id, 'Progress reporting', 'Summarises what was done and what to review', 'file-text'
from public.agents where slug = 'arclio';

-- ProcureCall capabilities
insert into public.agent_capabilities (agent_id, name, description, icon)
select id, 'Supplier outreach', 'Contacts suppliers and collects quotes automatically', 'mail'
from public.agents where slug = 'procurecall';

insert into public.agent_capabilities (agent_id, name, description, icon)
select id, 'RFQ management', 'Creates and tracks requests for quotation', 'clipboard-list'
from public.agents where slug = 'procurecall';

-- Servexa capabilities
insert into public.agent_capabilities (agent_id, name, description, icon)
select id, 'Inbound calls', 'Handles inbound customer calls with natural voice', 'phone-incoming'
from public.agents where slug = 'servexa';

insert into public.agent_capabilities (agent_id, name, description, icon)
select id, 'Outbound calls', 'Places outbound calls for follow-ups and reminders', 'phone-outgoing'
from public.agents where slug = 'servexa';

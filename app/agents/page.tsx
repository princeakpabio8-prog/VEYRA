/**
 * /agents — VEYRA agent catalogue.
 *
 * Server component: fetches all active agents from public.agents via RLS-safe
 * server client. Renders the full catalogue in the existing VEYRA design system.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Phone, LayoutGrid, ArrowLeft } from "lucide-react";
import { getActiveAgents } from "@/lib/supabase/queries";
import type { Agent } from "@/lib/supabase/queries";
import { BottomNav } from "@/components/BottomNav";
import { TopNav } from "@/components/TopNav";
import { RequestAgentButton } from "./RequestAgentButton";

export const metadata: Metadata = {
  title: "Agents",
  description: "Browse and deploy AI employees for your business.",
};

// ─── Icon mapping (mirrors PopularAgents logic) ───────────────────────────────
function AgentIcon({ slug, category }: { slug: string; category: string }) {
  const cls = "text-ivory";
  const size = 24;
  const sw   = 1.75;

  if (slug === "procurecall" || category === "procurement")
    return <ShoppingCart size={size} strokeWidth={sw} className={cls} />;
  if (slug === "servexa" || category === "voice")
    return <Phone size={size} strokeWidth={sw} className={cls} />;
  return <LayoutGrid size={size} strokeWidth={sw} className={cls} />;
}

// ─── Status pill ──────────────────────────────────────────────────────────────
const statusLabel: Record<Agent["status"], string> = {
  active:       "Active",
  beta:         "Beta",
  coming_soon:  "Coming soon",
  deprecated:   "Deprecated",
};

function StatusBadge({ status }: { status: Agent["status"] }) {
  const isBeta   = status === "beta";
  const isActive = status === "active";
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${
        isActive
          ? "border-surface-border bg-ivory text-ink-secondary"
          : isBeta
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-surface-border bg-surface-subtle text-ink-tertiary"
      }`}
    >
      {statusLabel[status]}
    </span>
  );
}

// ─── Single agent row card ─────────────────────────────────────────────────────
function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="flex items-center gap-4 rounded-2xl border border-surface-border bg-ivory-card px-5 py-4 transition-colors hover:bg-surface-subtle active:bg-surface-subtle"
      style={{ backgroundColor: "#eee9e0" }}
    >
      {/* Icon badge */}
      <div
        className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center rounded-[16px]"
        style={{ backgroundColor: "#2a2620" }}
      >
        <AgentIcon slug={agent.slug} category={agent.category} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[1rem] font-semibold text-ink leading-snug">{agent.name}</p>
          <StatusBadge status={agent.status} />
        </div>
        <p className="text-[0.82rem] text-ink-secondary leading-snug line-clamp-2">{agent.tagline}</p>
      </div>

      <ChevronRight size={18} strokeWidth={1.75} className="text-ink-tertiary flex-shrink-0" />
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AgentsPage() {
  const agents = await getActiveAgents();

  return (
    <div className="relative min-h-dvh" style={{ backgroundColor: "#f5f0e8" }}>
      <main className="mx-auto max-w-lg overflow-x-hidden pb-32">
        <TopNav />

        {/* Page header */}
        <div className="px-5 pt-2 pb-6">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-ink-secondary hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Home
          </Link>

          <h1
            className="text-[2.2rem] font-bold leading-[1.08] tracking-[-0.01em] text-ink"
            style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
          >
            All agents
          </h1>
          <p className="mt-2 text-[0.9rem] text-ink-secondary">
            {agents.length} AI {agents.length === 1 ? "employee" : "employees"} available
          </p>
        </div>

        {/* Catalogue */}
        {agents.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-[0.9rem] text-ink-tertiary">No agents available yet.</p>
          </div>
        ) : (
          <div className="px-5 flex flex-col gap-3">
            {agents.map((agent) => (
              <AgentCard key={agent.slug} agent={agent} />
            ))}
          </div>
        )}

        {/* Secondary paths */}
        <div className="px-5 mt-8 space-y-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-tertiary px-1">
            Can't find what you need?
          </p>

          {/* Request an employee */}
          <RequestAgentButton />

          {/* Build an agent */}
          <Link
            href="/build"
            className="flex items-center gap-3 rounded-2xl border border-surface-border px-5 py-4 transition-colors hover:bg-surface-subtle active:bg-surface-subtle"
            style={{ backgroundColor: "#eee9e0" }}
          >
            <div className="flex-1">
              <p className="text-[0.92rem] font-semibold text-ink">Build your own agent</p>
              <p className="text-[0.78rem] text-ink-secondary mt-0.5">Advanced: create a custom AI employee.</p>
            </div>
            <ChevronRight size={17} strokeWidth={1.75} className="text-ink-tertiary flex-shrink-0" />
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

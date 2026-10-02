/**
 * /agents/[slug] — agent detail page.
 *
 * Fetches the agent and its capabilities from Supabase.
 * Returns a not-found state for unknown or inactive slugs.
 * Includes Try panel and Deploy CTA.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShoppingCart, Phone, LayoutGrid } from "lucide-react";
import { getAgentBySlug, getAgentCapabilities } from "@/lib/supabase/queries";
import type { Agent, Capability } from "@/lib/supabase/queries";
import { getAgentRegistryEntry } from "@/lib/agents/registry";
import { BottomNav } from "@/components/BottomNav";
import { TopNav } from "@/components/TopNav";
import { TryPanel } from "@/components/TryPanel";
import { HelpButton } from "@/components/HelpButton";

interface Props {
  params: Promise<{ slug: string }>;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) return { title: "Agent not found" };
  return {
    title: agent.name,
    description: agent.tagline,
  };
}

// ─── Icon (same mapping as catalogue) ────────────────────────────────────────
function AgentIcon({ slug, category }: { slug: string; category: string }) {
  const size = 32;
  const sw   = 1.5;
  const cls  = "text-ivory";

  if (slug === "procurecall" || category === "procurement")
    return <ShoppingCart size={size} strokeWidth={sw} className={cls} />;
  if (slug === "servexa" || category === "voice")
    return <Phone size={size} strokeWidth={sw} className={cls} />;
  return <LayoutGrid size={size} strokeWidth={sw} className={cls} />;
}

// ─── Pricing label ────────────────────────────────────────────────────────────
function pricingLabel(agent: Agent): string {
  if (agent.pricing_model === "free") return "Free";
  if (agent.pricing_model === "per_usage") return "Usage-based pricing";
  if (agent.base_monthly_price_usd !== null)
    return `From $${agent.base_monthly_price_usd.toFixed(2)} / month`;
  return "Contact for pricing";
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusLabel: Record<Agent["status"], string> = {
  active:      "Active",
  beta:        "Beta",
  coming_soon: "Coming soon",
  deprecated:  "Deprecated",
};

function StatusBadge({ status }: { status: Agent["status"] }) {
  const isBeta = status === "beta";
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.12em] ${
        isBeta
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-surface-border bg-ivory text-ink-secondary"
      }`}
    >
      {statusLabel[status]}
    </span>
  );
}

// ─── Capability row ───────────────────────────────────────────────────────────
function CapabilityRow({ capability }: { capability: Capability }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <CheckCircle2 size={18} strokeWidth={2} className="text-success mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-[0.9rem] font-semibold text-ink leading-snug">{capability.name}</p>
        {capability.description && (
          <p className="text-[0.82rem] text-ink-secondary leading-snug mt-0.5">{capability.description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AgentPage({ params }: Props) {
  const { slug } = await params;

  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  const caps = await getAgentCapabilities(agent.id);
  const registry = getAgentRegistryEntry(agent.slug);

  const canDeploy = agent.status === "active" || agent.status === "beta";

  return (
    <div className="relative min-h-dvh" style={{ backgroundColor: "#f5f0e8" }}>
      <main className="mx-auto max-w-lg overflow-x-hidden pb-32">
        <TopNav />

        <div className="px-5 pt-2">
          {/* Back link */}
          <Link
            href="/agents"
            className="mb-6 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-ink-secondary hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            All agents
          </Link>

          {/* Agent hero */}
          <div
            className="rounded-3xl p-6 mb-6"
            style={{ backgroundColor: "#eae4d9" }}
          >
            <div className="flex items-start gap-4 mb-4">
              {/* Icon */}
              <div
                className="flex h-[68px] w-[68px] flex-shrink-0 items-center justify-center rounded-[20px]"
                style={{ backgroundColor: "#2a2620" }}
              >
                <AgentIcon slug={agent.slug} category={agent.category} />
              </div>

              {/* Name + status */}
              <div className="flex-1 min-w-0 pt-1">
                <h1
                  className="text-[2rem] font-bold leading-[1.08] tracking-[-0.01em] text-ink"
                  style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
                >
                  {agent.name}
                </h1>
                <div className="mt-1.5">
                  <StatusBadge status={agent.status} />
                </div>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-[0.95rem] font-medium text-ink leading-snug mb-2">
              {agent.tagline}
            </p>

            {/* Description */}
            <p className="text-[0.85rem] text-ink-secondary leading-[1.6]">
              {agent.description}
            </p>

            {/* Pricing */}
            <div className="mt-4 pt-4 border-t border-surface-border">
              <p className="text-[0.75rem] font-medium text-ink-tertiary uppercase tracking-[0.1em] mb-1">Pricing</p>
              <p className="text-[0.9rem] font-semibold text-ink">{pricingLabel(agent)}</p>
            </div>
          </div>

          {/* Capabilities */}
          {caps.length > 0 && (
            <div className="mb-6">
              <h2
                className="text-[1.3rem] font-bold tracking-[-0.01em] text-ink mb-1"
                style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
              >
                Capabilities
              </h2>
              <div className="divide-y divide-surface-border">
                {caps.map((cap) => (
                  <CapabilityRow key={cap.id} capability={cap} />
                ))}
              </div>
            </div>
          )}

          {/* Try panel — only for agents with a registry entry */}
          {registry && (
            <div
              className="rounded-3xl p-6 mb-6"
              style={{ backgroundColor: "#eae4d9" }}
            >
              <TryPanel agentSlug={agent.slug} registry={registry} />
            </div>
          )}

          {/* Deploy CTA */}
          <div className="space-y-3 pb-6">
            {canDeploy && registry ? (
              <Link
                href={`/deploy/${agent.slug}/setup`}
                className="block w-full rounded-full bg-ink px-6 py-3.5 text-center text-[0.9rem] font-semibold text-ivory transition-opacity active:opacity-80"
              >
                Deploy {agent.name}
              </Link>
            ) : (
              <button
                disabled
                className="w-full rounded-full bg-ink px-6 py-3.5 text-[0.9rem] font-semibold text-ivory opacity-40 cursor-not-allowed"
              >
                Deploy {agent.name} — coming soon
              </button>
            )}
            <div className="flex justify-center">
              <HelpButton agentSlug={agent.slug} variant="subtle" />
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

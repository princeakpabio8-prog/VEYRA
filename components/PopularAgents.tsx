import Link from "next/link";
import { ChevronRight, ShoppingCart, Phone, LayoutGrid } from "lucide-react";
import type { Agent } from "@/lib/supabase/queries";

// ─── Icon mapping ─────────────────────────────────────────────────────────────
// Maps a slug or category to a Lucide icon. Extend as agents are added.
function AgentIcon({ slug, category }: { slug: string; category: string }) {
  const cls = "text-ivory";
  const size = 22;
  const sw   = 1.75;

  if (slug === "procurecall" || category === "procurement")
    return <ShoppingCart size={size} strokeWidth={sw} className={cls} />;
  if (slug === "servexa" || category === "voice")
    return <Phone size={size} strokeWidth={sw} className={cls} />;
  // Default fallback
  return <LayoutGrid size={size} strokeWidth={sw} className={cls} />;
}

function AgentIconBadge({ slug, category }: { slug: string; category: string }) {
  return (
    <div
      className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[14px]"
      style={{ backgroundColor: "#2a2620" }}
    >
      <AgentIcon slug={slug} category={category} />
    </div>
  );
}

interface Props {
  agents: Agent[];
}

export function PopularAgents({ agents }: Props) {
  return (
    <section className="px-5 pb-32">
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <h2
          className="text-[1.5rem] font-bold tracking-[-0.01em] text-ink"
          style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
        >
          Popular agents
        </h2>
        <Link
          href="/agents"
          className="flex items-center gap-1 text-[0.82rem] font-medium text-ink-secondary transition-colors hover:text-ink active:text-ink"
        >
          View all
          <ChevronRight size={14} strokeWidth={2} />
        </Link>
      </div>

      {/* Agent list */}
      {agents.length === 0 ? (
        <p className="text-[0.85rem] text-ink-tertiary py-4">No agents available yet.</p>
      ) : (
        <div className="divide-y divide-surface-border">
          {agents.map((agent) => (
            <Link
              key={agent.slug}
              href={`/agents/${agent.slug}`}
              className="flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-surface-subtle active:bg-surface-subtle -mx-1 px-1 rounded-lg"
            >
              <AgentIconBadge slug={agent.slug} category={agent.category} />
              <div className="flex-1 min-w-0">
                <p className="text-[0.95rem] font-semibold text-ink leading-snug">{agent.name}</p>
                <p className="text-[0.82rem] text-ink-secondary leading-snug mt-0.5">{agent.tagline}</p>
              </div>
              <ChevronRight size={18} strokeWidth={1.75} className="text-ink-tertiary flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

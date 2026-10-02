/**
 * /my-employees — "My AI Employees" customer dashboard.
 *
 * Protected route. Shows the customer's deployed AI employees.
 * Primary action: Open a deployed employee.
 * Secondary: Deploy a new employee, Request a custom employee.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingCart, Phone, LayoutGrid, ChevronRight, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUserDeployments } from "@/lib/actions/deployment";
import type { DeploymentWithAgent } from "@/lib/actions/deployment";
import { getAgentRegistryEntry } from "@/lib/agents/registry";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { RequestAgentSection } from "./RequestAgentSection";

export const metadata: Metadata = {
  title: "My AI Employees",
};

// ─── Agent icon ───────────────────────────────────────────────────────────────
function AgentIcon({ slug, category }: { slug: string; category: string }) {
  const cls = "text-ivory";
  const size = 22;
  const sw = 1.75;

  if (slug === "procurecall" || category === "procurement")
    return <ShoppingCart size={size} strokeWidth={sw} className={cls} />;
  if (slug === "servexa" || category === "voice")
    return <Phone size={size} strokeWidth={sw} className={cls} />;
  return <LayoutGrid size={size} strokeWidth={sw} className={cls} />;
}

// ─── Status dot ──────────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-success",
    paused: "bg-warning",
    draft:  "bg-ink-tertiary",
  };
  const labels: Record<string, string> = {
    active: "Ready",
    paused: "Paused",
    draft:  "Draft",
  };
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${colors[status] ?? "bg-ink-tertiary"}`} />
      <span className="text-[0.72rem] font-medium text-ink-secondary">
        {labels[status] ?? status}
      </span>
    </span>
  );
}

// ─── Deployed employee card ───────────────────────────────────────────────────
function EmployeeCard({ deployment }: { deployment: DeploymentWithAgent }) {
  const agent = deployment.agents as { slug: string; name: string; tagline: string; category: string; status: string } | null;
  if (!agent) return null;

  const registry = getAgentRegistryEntry(agent.slug);

  return (
    <Link
      href={`/my-employees/${deployment.id}`}
      className="flex items-center gap-4 rounded-2xl border border-surface-border px-5 py-4 transition-colors active:bg-surface-subtle"
      style={{ backgroundColor: "#eee9e0" }}
    >
      {/* Icon */}
      <div
        className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-[15px]"
        style={{ backgroundColor: "#2a2620" }}
      >
        <AgentIcon slug={agent.slug} category={agent.category} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[0.95rem] font-semibold text-ink leading-snug truncate">{deployment.name}</p>
        <p className="text-[0.78rem] text-ink-secondary leading-snug">
          {registry?.roleDescription ?? agent.tagline}
        </p>
        <div className="mt-1.5">
          <StatusDot status={deployment.status} />
        </div>
      </div>

      {/* Open CTA */}
      <div className="flex-shrink-0 flex items-center gap-1">
        <span className="text-[0.78rem] font-semibold text-ink">Open</span>
        <ChevronRight size={15} strokeWidth={2} className="text-ink-tertiary" />
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function MyEmployeesPage() {
  const user = await requireUser();
  const deployments = await getUserDeployments();

  return (
    <div className="relative min-h-dvh" style={{ backgroundColor: "#f5f0e8" }}>
      <main className="mx-auto max-w-lg overflow-x-hidden pb-32">
        <TopNav />

        <div className="px-5 pt-2 pb-6">
          {/* Header */}
          <div className="mb-6">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-1">
              Your workspace
            </p>
            <h1
              className="text-[2.2rem] font-bold leading-[1.08] tracking-[-0.01em] text-ink"
              style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
            >
              My AI Employees
            </h1>
          </div>

          {/* Deployed employees */}
          {deployments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[0.95rem] font-medium text-ink mb-2">No AI employees deployed yet</p>
              <p className="text-[0.85rem] text-ink-secondary mb-6">
                Browse the marketplace and deploy your first AI employee.
              </p>
              <Link
                href="/agents"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.88rem] font-semibold text-ivory"
              >
                <Plus size={16} strokeWidth={2} />
                Browse AI employees
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8">
              {deployments.map((d) => (
                <EmployeeCard key={d.id} deployment={d} />
              ))}
            </div>
          )}

          {/* Deploy more */}
          {deployments.length > 0 && (
            <div className="mb-8">
              <Link
                href="/agents"
                className="flex items-center justify-center gap-2 w-full rounded-full border border-surface-border bg-ivory px-6 py-3 text-[0.85rem] font-medium text-ink-secondary hover:text-ink hover:border-ink/20 transition-colors"
              >
                <Plus size={16} strokeWidth={2} />
                Deploy another AI employee
              </Link>
            </div>
          )}

          {/* Request / Build section */}
          <RequestAgentSection />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

/**
 * /my-employees/[id] — deployment workspace.
 *
 * Protected route. The primary customer workspace for each deployed AI employee.
 * "What would you like your AI employee to do?"
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShoppingCart, Phone, LayoutGrid } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getDeploymentById, getDeploymentTasks } from "@/lib/actions/deployment";
import { getAgentRegistryEntry } from "@/lib/agents/registry";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { HelpButton } from "@/components/HelpButton";
import { TaskWorkspace } from "./TaskWorkspace";
import type { TaskResult } from "@/lib/agents/executor";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const deployment = await getDeploymentById(id);
  if (!deployment) return { title: "Workspace" };
  return { title: deployment.name };
}

// ─── Agent icon ───────────────────────────────────────────────────────────────
function AgentIcon({ slug, category }: { slug: string; category: string }) {
  const cls = "text-ivory";
  if (slug === "procurecall" || category === "procurement")
    return <ShoppingCart size={28} strokeWidth={1.5} className={cls} />;
  if (slug === "servexa" || category === "voice")
    return <Phone size={28} strokeWidth={1.5} className={cls} />;
  return <LayoutGrid size={28} strokeWidth={1.5} className={cls} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function EmployeeWorkspacePage({ params }: Props) {
  const { id } = await params;
  await requireUser();

  const deployment = await getDeploymentById(id);
  if (!deployment) notFound();

  const agent = deployment.agents;

  if (!agent) notFound();

  const registry = getAgentRegistryEntry(agent.slug);
  if (!registry) notFound();

  // Fetch recent tasks for this deployment
  const rawTasks = await getDeploymentTasks(id);
  const recentTasks = rawTasks.map((t) => ({
    id: t.id,
    result: (t.result as TaskResult | null) ?? null,
    input: (t.input as Record<string, string>) ?? {},
    created_at: t.created_at,
  }));

  return (
    <div className="relative min-h-dvh" style={{ backgroundColor: "#f5f0e8" }}>
      <main className="mx-auto max-w-lg overflow-x-hidden pb-32">
        <TopNav />

        <div className="px-5 pt-2">
          {/* Back */}
          <Link
            href="/my-employees"
            className="mb-5 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-ink-secondary hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            My AI Employees
          </Link>

          {/* Employee header */}
          <div className="flex items-center gap-4 mb-6">
            <div
              className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-[18px]"
              style={{ backgroundColor: "#2a2620" }}
            >
              <AgentIcon slug={agent.slug} category={agent.category} />
            </div>
            <div className="flex-1 min-w-0">
              <h1
                className="text-[1.6rem] font-bold leading-[1.1] tracking-[-0.01em] text-ink"
                style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
              >
                {deployment.name}
              </h1>
              <p className="text-[0.8rem] text-ink-secondary">{registry.workerTitle}</p>
            </div>
          </div>

          {/* Task workspace */}
          <TaskWorkspace
            deploymentId={id}
            agentSlug={agent.slug}
            registry={registry}
            recentTasks={recentTasks}
          />

          {/* Help */}
          <div className="mt-6 pb-4 flex justify-center">
            <HelpButton agentSlug={agent.slug} deploymentId={id} variant="subtle" />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

/**
 * /deploy/[agentSlug]/setup — deployment setup page.
 *
 * Protected route (middleware handles redirect to /login).
 * Renders agent-specific setup wizard driven by the agent registry.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { getAgentBySlug } from "@/lib/supabase/queries";
import { getAgentRegistryEntry } from "@/lib/agents/registry";
import { TopNav } from "@/components/TopNav";
import { BottomNav } from "@/components/BottomNav";
import { DeploymentSetupWizard } from "./DeploymentSetupWizard";
import { HelpButton } from "@/components/HelpButton";

interface Props {
  params: Promise<{ agentSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { agentSlug } = await params;
  const agent = await getAgentBySlug(agentSlug);
  if (!agent) return { title: "Setup" };
  return { title: `Deploy ${agent.name}` };
}

export default async function DeploySetupPage({ params }: Props) {
  const { agentSlug } = await params;

  const agent = await getAgentBySlug(agentSlug);
  if (!agent) notFound();

  const registry = getAgentRegistryEntry(agent.slug);
  if (!registry) notFound();

  return (
    <div className="relative min-h-dvh" style={{ backgroundColor: "#f5f0e8" }}>
      <main className="mx-auto max-w-lg overflow-x-hidden pb-32">
        <TopNav />

        <div className="px-5 pt-2">
          {/* Back */}
          <Link
            href={`/agents/${agent.slug}`}
            className="mb-6 inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-ink-secondary hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Back to {agent.name}
          </Link>

          {/* Header */}
          <div className="mb-6">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-ink-tertiary mb-1">
              Deploy
            </p>
            <h1
              className="text-[2rem] font-bold leading-[1.08] tracking-[-0.01em] text-ink"
              style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
            >
              {agent.name}
            </h1>
            <p className="mt-1.5 text-[0.88rem] text-ink-secondary leading-snug">
              {registry.roleDescription}
            </p>
          </div>

          {/* Setup card */}
          <div
            className="rounded-3xl p-6 mb-5"
            style={{ backgroundColor: "#eae4d9" }}
          >
            <p className="text-[0.82rem] font-semibold text-ink-secondary uppercase tracking-[0.1em] mb-4">
              Quick setup
            </p>
            <DeploymentSetupWizard agent={agent} registry={registry} />
          </div>

          {/* Human help */}
          <div className="pb-4">
            <HelpButton agentSlug={agent.slug} variant="subtle" />
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

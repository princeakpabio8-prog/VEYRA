"use client";

/**
 * Deployment setup wizard — agent-aware, minimal.
 *
 * Reads agent registry to render the correct config fields.
 * No generic forms. No technical terminology.
 * Fields are defined per-agent in lib/agents/registry.ts.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Agent } from "@/lib/supabase/queries";
import type { AgentRegistryEntry } from "@/lib/agents/registry";
import { createDeployment } from "@/lib/actions/deployment";

interface Props {
  agent: Agent;
  registry: AgentRegistryEntry;
}

export function DeploymentSetupWizard({ agent, registry }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleDeploy() {
    // Validate required fields
    for (const field of registry.deploymentConfigFields) {
      if (field.required && !values[field.key]?.trim()) {
        setError(`Please fill in: ${field.label}`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    // Deployment name defaults to company/business name if provided, else agent name
    const deploymentName =
      (values["company_name"] || values["business_name"] || "").trim() ||
      `My ${agent.name}`;

    const result = await createDeployment({
      agentId: agent.id,
      agentSlug: agent.slug,
      name: deploymentName,
      config: { ...values, _agent_slug: agent.slug },
    });

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/my-employees/${result.data!.deploymentId}`);
  }

  return (
    <div className="space-y-6">
      {/* Setup fields */}
      {registry.deploymentConfigFields.map((field) => (
        <div key={field.key}>
          <label className="block text-[0.85rem] font-semibold text-ink mb-1.5">
            {field.label}
            {field.required && <span className="text-ink-tertiary ml-1">*</span>}
          </label>
          {field.helpText && (
            <p className="text-[0.78rem] text-ink-tertiary mb-2 leading-snug">{field.helpText}</p>
          )}
          {field.type === "textarea" ? (
            <textarea
              rows={3}
              value={values[field.key] ?? ""}
              onChange={(e) => setValue(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-surface-border bg-ivory px-4 py-3 text-[0.88rem] text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink/20 resize-none"
            />
          ) : (
            <input
              type="text"
              value={values[field.key] ?? ""}
              onChange={(e) => setValue(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-surface-border bg-ivory px-4 py-3 text-[0.88rem] text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          )}
        </div>
      ))}

      {error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-[0.82rem] text-red-700">
          {error}
        </p>
      )}

      <button
        onClick={handleDeploy}
        disabled={loading}
        className="w-full rounded-full bg-ink px-6 py-3.5 text-[0.9rem] font-semibold text-ivory disabled:opacity-50 transition-opacity active:opacity-80"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
            Setting up…
          </span>
        ) : (
          `Deploy ${agent.name}`
        )}
      </button>
    </div>
  );
}

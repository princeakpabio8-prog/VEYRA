"use client";

/**
 * TryPanel — interactive "Try" experience on agent detail page.
 *
 * Uses the mock execution layer to demonstrate the agent's capability.
 * Results are clearly marked as demo/simulation.
 * Driven entirely by the agent registry — no agent-specific if/else.
 */

import { useState } from "react";
import type { AgentRegistryEntry } from "@/lib/agents/registry";
import { getExecutor } from "@/lib/agents/executor";
import type { TaskResult } from "@/lib/agents/executor";
import { ArclioResultView } from "./results/ArclioResultView";
import { ProcureCallResultView } from "./results/ProcureCallResultView";
import { ServexaResultView } from "./results/ServexaResultView";

interface Props {
  agentSlug: string;
  registry: AgentRegistryEntry;
}

type TryState = "idle" | "running" | "done" | "error";

export function TryPanel({ agentSlug, registry }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [state, setState] = useState<TryState>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<TaskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function setValue(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleTry() {
    const required = registry.taskInputFields.filter((f) => f.required);
    for (const field of required) {
      if (!values[field.key]?.trim()) {
        setError(`Please fill in: ${field.label}`);
        return;
      }
    }

    setError(null);
    setState("running");
    setStepIndex(0);
    setResult(null);

    // Animate through execution steps
    for (let i = 0; i < registry.executionSteps.length; i++) {
      setStepIndex(i);
      await new Promise((r) => setTimeout(r, 500));
    }

    // Run mock executor client-side (demo only — no Supabase persistence for Try)
    const executor = getExecutor(agentSlug);
    if (!executor) {
      setState("error");
      setError("No executor available for this agent.");
      return;
    }

    const execution = await executor.executeTask("demo", values);
    if (execution.result) {
      setResult(execution.result);
      setState("done");
    } else {
      setState("error");
      setError(execution.error_message ?? "Something went wrong.");
    }
  }

  function handleReset() {
    setState("idle");
    setResult(null);
    setError(null);
    setStepIndex(0);
  }

  return (
    <div>
      <h2
        className="text-[1.3rem] font-bold tracking-[-0.01em] text-ink mb-1"
        style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
      >
        Try it
      </h2>
      <p className="text-[0.82rem] text-ink-secondary mb-4">
        {registry.tryPrompt}
      </p>

      {/* Demo badge */}
      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber-700">
          Demo mode — simulated result
        </span>
      </div>

      {state === "idle" || state === "error" ? (
        <div className="space-y-4">
          {registry.taskInputFields.map((field) => (
            <div key={field.key}>
              <label className="block text-[0.82rem] font-semibold text-ink mb-1.5">
                {field.label}
              </label>
              {field.helpText && (
                <p className="text-[0.75rem] text-ink-tertiary mb-1.5">{field.helpText}</p>
              )}
              {field.type === "textarea" || field.type === "tel-list" ? (
                <textarea
                  rows={field.type === "tel-list" ? 3 : 3}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-surface-border bg-ivory px-4 py-3 text-[0.85rem] text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink/20 resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full rounded-xl border border-surface-border bg-ivory px-4 py-3 text-[0.85rem] text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              )}
            </div>
          ))}

          {error && (
            <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-[0.8rem] text-red-700">
              {error}
            </p>
          )}

          <button
            onClick={handleTry}
            className="w-full rounded-full bg-ink px-6 py-3.5 text-[0.9rem] font-semibold text-ivory transition-opacity active:opacity-80"
          >
            Try demo
          </button>
        </div>
      ) : state === "running" ? (
        <div className="py-8 space-y-3">
          {registry.executionSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  i < stepIndex
                    ? "bg-success"
                    : i === stepIndex
                    ? "bg-ink animate-pulse"
                    : "bg-surface-border"
                }`}
              />
              <span
                className={`text-[0.85rem] ${
                  i === stepIndex ? "text-ink font-medium" : i < stepIndex ? "text-ink-secondary" : "text-ink-disabled"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {result && (
            <>
              <DemoResultView agentSlug={agentSlug} result={result} />
              <button
                onClick={handleReset}
                className="w-full rounded-full border border-surface-border bg-ivory px-6 py-3 text-[0.85rem] font-medium text-ink-secondary hover:text-ink transition-colors"
              >
                Try again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DemoResultView({ agentSlug, result }: { agentSlug: string; result: TaskResult }) {
  if (agentSlug === "arclio") return <ArclioResultView result={result} />;
  if (agentSlug === "procurecall") return <ProcureCallResultView result={result} />;
  if (agentSlug === "servexa") return <ServexaResultView result={result} />;
  return (
    <div className="rounded-2xl border border-surface-border bg-ivory p-4">
      <p className="text-[0.85rem] font-semibold text-ink mb-1">{result.summary}</p>
      <pre className="text-[0.72rem] text-ink-secondary mt-2 overflow-auto">
        {JSON.stringify(result.data, null, 2)}
      </pre>
    </div>
  );
}

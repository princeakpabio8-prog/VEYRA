"use client";

/**
 * TaskWorkspace — the main "put it to work" interface.
 *
 * Renders the agent-specific task input fields (from registry),
 * submits tasks via server action, and shows task status + result.
 * Uses mock execution layer — results clearly labeled as demo.
 */

import { useState } from "react";
import type { AgentRegistryEntry, ConfigField } from "@/lib/agents/registry";
import type { TaskResult } from "@/lib/agents/executor";
import { submitTask } from "@/lib/actions/deployment";
import { ArclioResultView } from "@/components/results/ArclioResultView";
import { ProcureCallResultView } from "@/components/results/ProcureCallResultView";
import { ServexaResultView } from "@/components/results/ServexaResultView";

interface Task {
  id: string;
  result: TaskResult | null;
  input: Record<string, string>;
  created_at: string;
}

interface Props {
  deploymentId: string;
  agentSlug: string;
  registry: AgentRegistryEntry;
  recentTasks: Task[];
}

type WorkState = "idle" | "running" | "done" | "error";

export function TaskWorkspace({ deploymentId, agentSlug, registry, recentTasks }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [workState, setWorkState] = useState<WorkState>("idle");
  const [stepIndex, setStepIndex] = useState(0);
  const [latestResult, setLatestResult] = useState<TaskResult | null>(null);
  const [tasks, setTasks] = useState<Task[]>(recentTasks);
  const [error, setError] = useState<string | null>(null);

  function setValue(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    const required = registry.taskInputFields.filter((f) => f.required);
    for (const field of required) {
      if (!values[field.key]?.trim()) {
        setError(`Please fill in: ${field.label}`);
        return;
      }
    }

    setError(null);
    setWorkState("running");
    setStepIndex(0);

    // Animate progress steps
    for (let i = 0; i < registry.executionSteps.length; i++) {
      setStepIndex(i);
      await new Promise((r) => setTimeout(r, 600));
    }

    const result = await submitTask({
      deploymentId,
      agentSlug,
      taskInput: { ...values },
    });

    if (!result.success || !result.data) {
      setWorkState("error");
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    const taskResult = result.data.result as TaskResult | null;
    setLatestResult(taskResult);
    setWorkState("done");

    // Add to local task list
    if (taskResult) {
      setTasks((prev) => [
        {
          id: result.data!.taskId,
          result: taskResult,
          input: { ...values },
          created_at: new Date().toISOString(),
        },
        ...prev.slice(0, 4),
      ]);
    }
  }

  function handleNewTask() {
    setWorkState("idle");
    setLatestResult(null);
    setError(null);
    setValues({});
    setStepIndex(0);
  }

  return (
    <div>
      {/* Primary work area */}
      <div
        className="rounded-3xl p-6 mb-6"
        style={{ backgroundColor: "#eae4d9" }}
      >
        {workState === "idle" || workState === "error" ? (
          <div className="space-y-5">
            <div>
              <h2
                className="text-[1.4rem] font-bold tracking-[-0.01em] text-ink mb-1"
                style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
              >
                {registry.primaryPrompt}
              </h2>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5">
                <span className="text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-amber-700">
                  Demo mode
                </span>
              </div>
            </div>

            {registry.taskInputFields.map((field: ConfigField) => (
              <FieldInput
                key={field.key}
                field={field}
                value={values[field.key] ?? ""}
                onChange={(v) => setValue(field.key, v)}
              />
            ))}

            {error && (
              <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-[0.8rem] text-red-700">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              className="w-full rounded-full bg-ink px-6 py-3.5 text-[0.9rem] font-semibold text-ivory transition-opacity active:opacity-80"
            >
              Submit task
            </button>
          </div>
        ) : workState === "running" ? (
          <div>
            <h2
              className="text-[1.2rem] font-bold text-ink mb-5"
              style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
            >
              Working…
            </h2>
            <div className="space-y-3">
              {registry.executionSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full flex-shrink-0 transition-all ${
                      i < stepIndex
                        ? "bg-success"
                        : i === stepIndex
                        ? "bg-ink animate-pulse"
                        : "bg-surface-border"
                    }`}
                  />
                  <span
                    className={`text-[0.85rem] transition-colors ${
                      i === stepIndex
                        ? "text-ink font-medium"
                        : i < stepIndex
                        ? "text-ink-secondary"
                        : "text-ink-disabled"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {latestResult && (
              <ResultView agentSlug={agentSlug} result={latestResult} />
            )}
            <button
              onClick={handleNewTask}
              className="w-full rounded-full border border-surface-border bg-ivory px-6 py-3 text-[0.85rem] font-medium text-ink-secondary hover:text-ink transition-colors"
            >
              Submit another task
            </button>
          </div>
        )}
      </div>

      {/* Recent tasks */}
      {tasks.length > 0 && workState !== "running" && (
        <div>
          <h3
            className="text-[1rem] font-bold text-ink mb-3"
            style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
          >
            Recent tasks
          </h3>
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <RecentTaskRow key={task.id} task={task} agentSlug={agentSlug} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Field input ──────────────────────────────────────────────────────────────
function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ConfigField;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[0.85rem] font-semibold text-ink mb-1.5">
        {field.label}
        {field.required && <span className="text-ink-tertiary ml-1">*</span>}
      </label>
      {field.helpText && (
        <p className="text-[0.75rem] text-ink-tertiary mb-2">{field.helpText}</p>
      )}
      {field.type === "textarea" || field.type === "tel-list" ? (
        <textarea
          rows={field.type === "tel-list" ? 4 : 3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-surface-border bg-ivory px-4 py-3 text-[0.85rem] text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink/20 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-surface-border bg-ivory px-4 py-3 text-[0.85rem] text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink/20"
        />
      )}
    </div>
  );
}

// ─── Result dispatcher ────────────────────────────────────────────────────────
function ResultView({ agentSlug, result }: { agentSlug: string; result: TaskResult }) {
  if (agentSlug === "arclio") return <ArclioResultView result={result} />;
  if (agentSlug === "procurecall") return <ProcureCallResultView result={result} />;
  if (agentSlug === "servexa") return <ServexaResultView result={result} />;
  return (
    <div className="rounded-2xl border border-surface-border bg-ivory p-4">
      <p className="text-[0.85rem] font-semibold text-ink">{result.summary}</p>
    </div>
  );
}

// ─── Recent task row ──────────────────────────────────────────────────────────
function RecentTaskRow({ task, agentSlug }: { task: Task; agentSlug: string }) {
  const [expanded, setExpanded] = useState(false);

  const primaryInput = Object.entries(task.input).find(
    ([k]) => k === "task" || k === "objective"
  );
  const preview = primaryInput ? String(primaryInput[1]).slice(0, 80) : "Task";

  return (
    <div
      className="rounded-2xl border border-surface-border overflow-hidden"
      style={{ backgroundColor: "#eee9e0" }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[0.82rem] font-medium text-ink leading-snug line-clamp-1">{preview}</p>
          <p className="text-[0.72rem] text-ink-tertiary mt-0.5">
            {new Date(task.created_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
            })}
            {task.result?.is_demo && (
              <span className="ml-2 text-amber-600">· Demo</span>
            )}
          </p>
        </div>
        <span className="text-[0.72rem] text-ink-tertiary mt-0.5">{expanded ? "Hide" : "View"}</span>
      </button>

      {expanded && task.result && (
        <div className="px-4 pb-4">
          <ResultView agentSlug={agentSlug} result={task.result} />
        </div>
      )}
    </div>
  );
}

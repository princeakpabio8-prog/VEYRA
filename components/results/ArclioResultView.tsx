import type { TaskResult } from "@/lib/agents/executor";
import { CheckCircle2 } from "lucide-react";

interface Step {
  step: number;
  action: string;
  detail: string;
}

export function ArclioResultView({ result }: { result: TaskResult }) {
  const data = result.data as {
    steps_taken?: Step[];
    actions_performed?: string[];
    outcome?: string;
    next_steps?: string[];
    demo_note?: string;
  };

  return (
    <div className="space-y-3">
      {/* Demo badge */}
      {result.is_demo && (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber-700">
            Simulated demo result
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-surface-border bg-ivory p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 size={16} strokeWidth={2} className="text-success" />
          <p className="text-[0.88rem] font-semibold text-ink">{result.summary}</p>
        </div>

        {/* Steps taken */}
        {data.steps_taken && data.steps_taken.length > 0 && (
          <div className="space-y-2 mb-3">
            {data.steps_taken.map((s) => (
              <div key={s.step} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-ink text-[0.6rem] font-bold text-ivory">
                  {s.step}
                </span>
                <div>
                  <p className="text-[0.8rem] font-semibold text-ink leading-snug">{s.action}</p>
                  <p className="text-[0.76rem] text-ink-secondary leading-snug">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions performed */}
        {data.actions_performed && data.actions_performed.length > 0 && (
          <div className="border-t border-surface-border pt-3">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-ink-tertiary mb-1.5">
              Actions performed
            </p>
            <ul className="space-y-1">
              {data.actions_performed.map((a, i) => (
                <li key={i} className="text-[0.8rem] text-ink-secondary">• {a}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {data.demo_note && (
        <p className="text-[0.75rem] text-ink-tertiary leading-relaxed px-1">{data.demo_note}</p>
      )}
    </div>
  );
}

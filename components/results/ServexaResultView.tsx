import type { TaskResult } from "@/lib/agents/executor";
import { CheckCircle2, Phone } from "lucide-react";

interface CustomerResult {
  customer_identifier: string;
  call_duration_seconds: number;
  call_status: string;
  outcome: string;
  outcome_detail: string;
  follow_up_required: boolean;
  follow_up_note: string | null;
}

export function ServexaResultView({ result }: { result: TaskResult }) {
  const data = result.data as {
    objective?: string;
    total_customers_contacted?: number;
    conversations_completed?: number;
    positive_outcomes?: number;
    follow_ups_required?: number;
    customer_results?: CustomerResult[];
    outcome_breakdown?: { confirmed: number; scheduled: number; pending: number };
    demo_note?: string;
  };

  const outcomeColor: Record<string, string> = {
    "Confirmed":        "text-success",
    "Payment scheduled":"text-success",
    "Will call back":   "text-warning",
    "Requested more time": "text-warning",
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
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={16} strokeWidth={2} className="text-success" />
          <p className="text-[0.88rem] font-semibold text-ink">{result.summary}</p>
        </div>

        {/* Summary stats */}
        {data.outcome_breakdown && (
          <div className="grid grid-cols-3 gap-2 mb-3 p-3 rounded-xl" style={{ backgroundColor: "#f5f0e8" }}>
            <StatBlock label="Confirmed" value={data.outcome_breakdown.confirmed} color="text-success" />
            <StatBlock label="Scheduled" value={data.outcome_breakdown.scheduled} color="text-success" />
            <StatBlock label="Pending" value={data.outcome_breakdown.pending} color="text-warning" />
          </div>
        )}

        {/* Customer results */}
        {data.customer_results && data.customer_results.length > 0 && (
          <div className="space-y-2 mt-2">
            {data.customer_results.map((c, i) => (
              <div key={i} className="rounded-xl border border-surface-border p-3" style={{ backgroundColor: "#f5f0e8" }}>
                <div className="flex items-start gap-2">
                  <Phone size={13} strokeWidth={1.75} className="text-ink-tertiary flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-[0.82rem] font-semibold text-ink truncate">{c.customer_identifier}</p>
                      <span className={`text-[0.72rem] font-semibold flex-shrink-0 ${outcomeColor[c.outcome] ?? "text-ink-secondary"}`}>
                        {c.outcome}
                      </span>
                    </div>
                    <p className="text-[0.75rem] text-ink-secondary leading-snug">{c.outcome_detail}</p>
                    {c.follow_up_required && c.follow_up_note && (
                      <p className="mt-1 text-[0.72rem] text-warning">↻ {c.follow_up_note}</p>
                    )}
                    <p className="mt-1 text-[0.68rem] text-ink-tertiary">
                      Call: {Math.floor(c.call_duration_seconds / 60)}m {c.call_duration_seconds % 60}s
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data.demo_note && (
        <p className="text-[0.75rem] text-ink-tertiary leading-relaxed px-1">{data.demo_note}</p>
      )}
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-[1.3rem] font-bold ${color}`}>{value}</p>
      <p className="text-[0.68rem] text-ink-tertiary">{label}</p>
    </div>
  );
}

import type { TaskResult } from "@/lib/agents/executor";
import { CheckCircle2, Phone } from "lucide-react";

interface SupplierResult {
  supplier_name: string;
  phone: string;
  moq: number;
  unit_price_ngn: number;
  availability: string;
  delivery_terms: string;
  payment_terms: string;
  outcome: string;
  call_duration_seconds: number;
  notes?: string;
}

export function ProcureCallResultView({ result }: { result: TaskResult }) {
  const data = result.data as {
    objective?: string;
    total_suppliers_contacted?: number;
    supplier_results?: SupplierResult[];
    best_price?: { supplier: string; unit_price_ngn: number };
    recommendation?: string;
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
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 size={16} strokeWidth={2} className="text-success" />
          <p className="text-[0.88rem] font-semibold text-ink">{result.summary}</p>
        </div>
        {data.recommendation && (
          <p className="text-[0.78rem] text-ink-secondary mb-3 mt-1">{data.recommendation}</p>
        )}

        {/* Supplier results */}
        {data.supplier_results && data.supplier_results.length > 0 && (
          <div className="space-y-3 mt-2">
            {data.supplier_results.map((s, i) => (
              <div key={i} className="rounded-xl border border-surface-border p-3" style={{ backgroundColor: "#f5f0e8" }}>
                <div className="flex items-center gap-2 mb-2">
                  <Phone size={13} strokeWidth={1.75} className="text-ink-tertiary flex-shrink-0" />
                  <p className="text-[0.85rem] font-semibold text-ink">{s.supplier_name}</p>
                  <span className="ml-auto text-[0.7rem] text-success font-medium">{s.outcome}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <DataPoint label="MOQ" value={`${s.moq.toLocaleString()} units`} />
                  <DataPoint label="Unit price" value={`₦${s.unit_price_ngn.toLocaleString()}`} />
                  <DataPoint label="Availability" value={s.availability} />
                  <DataPoint label="Delivery" value={s.delivery_terms} />
                  <DataPoint label="Payment" value={s.payment_terms} />
                  <DataPoint label="Call time" value={`${Math.floor(s.call_duration_seconds / 60)}m ${s.call_duration_seconds % 60}s`} />
                </div>
                {s.notes && (
                  <p className="mt-2 text-[0.75rem] text-ink-secondary italic">{s.notes}</p>
                )}
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

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.68rem] font-medium text-ink-tertiary uppercase tracking-[0.08em]">{label}</p>
      <p className="text-[0.78rem] text-ink font-medium leading-snug">{value}</p>
    </div>
  );
}

// ─── Usage ────────────────────────────────────────────────────────────────────
// Metered usage events. One row per billable unit of work.

export interface UsageRecord {
  id: string;
  tenantId: string;
  deploymentId: string;
  callId: string | null;
  metricType: UsageMetricType;
  quantity: number;           // e.g. seconds, tokens, events
  unit: string;               // "seconds" | "tokens" | "messages"
  recordedAt: string;         // ISO-8601 timestamp
}

export type UsageMetricType =
  | "call_duration"
  | "llm_tokens"
  | "tts_characters"
  | "stt_seconds"
  | "api_calls";

/** Aggregated usage summary for billing/dashboard display. */
export interface UsageSummary {
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  totals: Partial<Record<UsageMetricType, number>>;
}

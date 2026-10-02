// ─── Call ─────────────────────────────────────────────────────────────────────
// Represents a single voice (or text) conversation session.

export interface Call {
  id: string;
  deploymentId: string;       // FK → deployments.id
  tenantId: string;
  callerIdentifier: string | null;  // Phone number, user ID, or anonymous
  direction: CallDirection;
  status: CallStatus;
  durationSeconds: number | null;
  startedAt: string | null;
  endedAt: string | null;
  recordingUrl: string | null;
  transcriptUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type CallDirection = "inbound" | "outbound";

export type CallStatus =
  | "initiated"
  | "ringing"
  | "in_progress"
  | "completed"
  | "failed"
  | "no_answer";

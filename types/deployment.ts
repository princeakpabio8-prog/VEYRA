// ─── Deployment ───────────────────────────────────────────────────────────────
// A Deployment is a customer's configured, live instance of an Agent.
// One tenant may deploy the same agent multiple times with different configs.

export interface Deployment {
  id: string;
  tenantId: string;         // Owning org / workspace
  agentId: string;          // FK → agents.id
  name: string;             // Customer-given label, e.g. "Support Bot - EU"
  config: DeploymentConfig;
  status: DeploymentStatus;
  voiceProviderId: string | null;   // FK → voice_providers.id (abstracted)
  externalCallbackUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Free-form per-deployment configuration stored as JSONB in Postgres. */
export interface DeploymentConfig {
  systemPrompt?: string;
  greeting?: string;
  language?: string;           // BCP-47 code, e.g. "en-US"
  timezone?: string;           // IANA tz, e.g. "America/New_York"
  maxCallDurationSeconds?: number;
  allowedIntegrationIds?: string[];
  [key: string]: unknown;      // agent-specific extension fields
}

export type DeploymentStatus =
  | "draft"
  | "active"
  | "paused"
  | "decommissioned";

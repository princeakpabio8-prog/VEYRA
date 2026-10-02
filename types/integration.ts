// ─── Integration ──────────────────────────────────────────────────────────────
// A third-party tool/service that can be authorized and used by deployments.

export interface Integration {
  id: string;
  tenantId: string;
  provider: IntegrationProvider;
  displayName: string;
  status: IntegrationStatus;
  scopes: string[];
  /** Encrypted credentials are stored server-side; this field is never exposed client-side. */
  credentialRef: string;    // Reference key to server-stored secret
  createdAt: string;
  updatedAt: string;
}

export type IntegrationProvider =
  | "google_workspace"
  | "microsoft_365"
  | "slack"
  | "notion"
  | "hubspot"
  | "salesforce"
  | "stripe"
  | "custom_webhook";

export type IntegrationStatus = "active" | "expired" | "revoked" | "error";

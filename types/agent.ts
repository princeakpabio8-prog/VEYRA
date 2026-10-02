// ─── Agent ────────────────────────────────────────────────────────────────────
// An Agent is a reusable product definition in the VEYRA marketplace.
// Individual agents (Arclio, ProcureCall, Servexa) are rows — not hard-coded.

export interface Agent {
  id: string;
  slug: string;             // URL-safe unique key, e.g. "arclio"
  name: string;             // Display name, e.g. "Arclio"
  tagline: string;
  description: string;
  avatarUrl: string | null;
  category: AgentCategory;
  capabilities: AgentCapability[];
  pricingModel: PricingModel;
  baseMonthlyPriceUsd: number | null;  // null = free / usage-only
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCapability {
  id: string;
  agentId: string;
  name: string;             // e.g. "Web search", "Email drafting"
  description: string;
  icon: string | null;      // Lucide icon name
}

export type AgentCategory =
  | "general"
  | "procurement"
  | "voice"
  | "finance"
  | "hr"
  | "support";

export type PricingModel = "per_seat" | "per_usage" | "flat" | "free";

export type AgentStatus = "active" | "beta" | "coming_soon" | "deprecated";

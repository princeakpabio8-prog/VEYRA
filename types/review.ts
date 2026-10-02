// ─── Review ───────────────────────────────────────────────────────────────────
// Marketplace rating & review left by a tenant for a deployed agent.

export interface Review {
  id: string;
  agentId: string;
  tenantId: string;
  authorId: string;           // FK → profiles.id
  rating: 1 | 2 | 3 | 4 | 5;
  title: string | null;
  body: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
}

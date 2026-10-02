/**
 * app/api/procurement/initiate-payment/route.ts
 *
 * POST /api/procurement/initiate-payment
 *
 * Accepts a customer-approved ProcurementOffer and creates a PayPal order.
 * Returns the PayPal order ID and the approval URL the buyer must visit.
 *
 * ─── Boundary ────────────────────────────────────────────────────────────────
 *
 *   This route does NOT:
 *     - Call ProcureCall or any supplier API.
 *     - Capture a payment automatically.
 *     - Accept offers that have not been explicitly approved by the customer.
 *
 *   Payment is only initiated when `approval.approved === true` is present in
 *   the request body.  The PayPal order is created with intent CAPTURE but the
 *   buyer must still complete checkout on PayPal before any funds move.
 *
 * ─── Request body ─────────────────────────────────────────────────────────────
 *
 *   {
 *     "offer": ProcurementOffer,
 *     "approval": {
 *       "approved": true,
 *       "approved_quantity": number,
 *       "approved_at": ISO string
 *     }
 *   }
 *
 * ─── Response ────────────────────────────────────────────────────────────────
 *
 *   200  { ok: true, intent: ProcurementPaymentIntent }
 *   400  { ok: false, error: string, missing?: string[] }
 *   502  { ok: false, error: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { initiatePayment, type CustomerApproval } from "@/lib/procurement/paymentOrchestration";
import type { ProcurementOffer } from "@/lib/procurement/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Request body must be valid JSON" },
      { status: 400 }
    );
  }

  const input = body as Record<string, unknown>;

  // ── Validate presence of required top-level fields ───────────────────────
  const missing: string[] = [];
  if (!input["offer"] || typeof input["offer"] !== "object") missing.push("offer");
  if (!input["approval"] || typeof input["approval"] !== "object") missing.push("approval");

  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields", missing },
      { status: 400 }
    );
  }

  const offer = input["offer"] as Partial<ProcurementOffer>;
  const approval = input["approval"] as Record<string, unknown>;

  // ── Validate offer shape ──────────────────────────────────────────────────
  const offerMissing: string[] = [];
  if (!offer.offer_id) offerMissing.push("offer.offer_id");
  if (!offer.objective) offerMissing.push("offer.objective");
  if (!offer.selected_quote) offerMissing.push("offer.selected_quote");
  if (!offer.currency) offerMissing.push("offer.currency");

  if (offerMissing.length > 0) {
    return NextResponse.json(
      { ok: false, error: "Incomplete offer object", missing: offerMissing },
      { status: 400 }
    );
  }

  // ── Validate approval ─────────────────────────────────────────────────────
  if (approval["approved"] !== true) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Payment cannot be initiated without explicit customer approval. approval.approved must be true.',
      },
      { status: 400 }
    );
  }

  if (
    typeof approval["approved_quantity"] !== "number" ||
    approval["approved_quantity"] <= 0
  ) {
    return NextResponse.json(
      { ok: false, error: "approval.approved_quantity must be a positive number" },
      { status: 400 }
    );
  }

  if (typeof approval["approved_at"] !== "string") {
    return NextResponse.json(
      { ok: false, error: "approval.approved_at must be an ISO timestamp string" },
      { status: 400 }
    );
  }

  const typedApproval: CustomerApproval = {
    approved: true,
    approved_quantity: approval["approved_quantity"] as number,
    approved_at: approval["approved_at"] as string,
  };

  try {
    const intent = await initiatePayment(offer as ProcurementOffer, typedApproval);

    return NextResponse.json({ ok: true, intent });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[procurement/initiate-payment]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

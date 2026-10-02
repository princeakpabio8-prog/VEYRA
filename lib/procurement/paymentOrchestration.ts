/**
 * lib/procurement/paymentOrchestration.ts
 *
 * Payment orchestration service for ProcureCall procurement offers.
 *
 * ─── Boundary contract ────────────────────────────────────────────────────────
 *
 *   INPUT:  A ProcurementOffer (produced by any AgentExecutor for "procurecall")
 *   OUTPUT: ProcurementPaymentIntent (PayPal order created, buyer must approve)
 *           ProcurementPaymentResult (after buyer approves and capture runs)
 *
 * This service:
 *   - NEVER calls ProcureCall or any supplier API directly.
 *   - NEVER automatically captures payment — the buyer must approve first.
 *   - ONLY accepts an already-approved offer from the customer.
 *   - Delegates all PayPal I/O to lib/paypal/client.ts.
 *
 * Plugging in a real ProcureCall executor later requires NO changes here.
 * The boundary is: executor produces ProcurementOffer → this service consumes it.
 */

// Server-only guard — this file imports PayPal credentials logic.
import "server-only";

import { createPayPalOrder, capturePayPalOrder } from "@/lib/paypal/client";
import type {
  ProcurementOffer,
  ProcurementPaymentIntent,
  ProcurementPaymentResult,
} from "./types";

// ─── Approval gate ────────────────────────────────────────────────────────────

/**
 * Explicit customer-approval state.
 *
 * The customer's UI must construct one of these and pass it to
 * initiatePayment().  The service rejects any offer where approved !== true.
 *
 * This is a deliberate seam: the UI is responsible for obtaining real consent,
 * and this service enforces that consent was recorded before touching PayPal.
 */
export interface CustomerApproval {
  /** Must be true — any other value causes initiatePayment() to throw. */
  approved: true;
  /**
   * Quantity the customer confirmed at approval time.
   * Overrides the default quantity on the offer.
   * Must be >= offer.selected_quote.moq.
   */
  approved_quantity: number;
  /**
   * ISO timestamp of when the customer clicked "Approve" / confirmed the offer.
   * Used for audit logging — not forwarded to PayPal.
   */
  approved_at: string;
}

// ─── Return URL helpers ───────────────────────────────────────────────────────

function resolveReturnUrl(offerId: string): string {
  const base =
    process.env["PAYPAL_RETURN_URL"] ??
    process.env["NEXT_PUBLIC_APP_URL"] ??
    "http://localhost:3000";

  // Strip any trailing path from the base so we can append cleanly.
  const origin = base.replace(/\/paypal\/return.*$/, "").replace(/\/$/, "");
  return `${origin}/paypal/return?offer_id=${encodeURIComponent(offerId)}`;
}

function resolveCancelUrl(offerId: string): string {
  const base =
    process.env["PAYPAL_CANCEL_URL"] ??
    process.env["NEXT_PUBLIC_APP_URL"] ??
    "http://localhost:3000";

  const origin = base.replace(/\/paypal\/cancel.*$/, "").replace(/\/$/, "");
  return `${origin}/paypal/cancel?offer_id=${encodeURIComponent(offerId)}`;
}

// ─── Orchestration service ────────────────────────────────────────────────────

/**
 * Initiates a PayPal payment for an approved ProcurementOffer.
 *
 * Prerequisites:
 *   1. The customer has reviewed the offer and constructed a CustomerApproval.
 *   2. The offer is not a demo (is_demo === false) — OR the caller explicitly
 *      understands it is a sandbox/demo payment and passes the offer anyway.
 *      (We do not block demo offers here; that decision belongs to the UI.)
 *
 * What this function does:
 *   - Validates the approval object.
 *   - Re-computes the total from the approved quantity to prevent drift.
 *   - Creates a PayPal order with intent CAPTURE (buyer must still approve on PayPal).
 *   - Returns a ProcurementPaymentIntent with the PayPal order ID and approval URL.
 *
 * What this function does NOT do:
 *   - Does not call ProcureCall.
 *   - Does not capture the payment (that requires a separate capturePayment() call).
 *   - Does not auto-redirect the buyer — the caller handles the redirect.
 *
 * @throws if approval is missing, quantity is below MOQ, or PayPal call fails.
 */
export async function initiatePayment(
  offer: ProcurementOffer,
  approval: CustomerApproval
): Promise<ProcurementPaymentIntent> {
  // ── Guard: explicit approval required ──────────────────────────────────────
  if (!approval || approval.approved !== true) {
    throw new Error(
      "procurement/payment: a CustomerApproval with approved=true is required before creating a PayPal order"
    );
  }

  // ── Guard: quantity must meet MOQ ──────────────────────────────────────────
  const { moq } = offer.selected_quote;
  if (approval.approved_quantity < moq) {
    throw new Error(
      `procurement/payment: approved_quantity (${approval.approved_quantity}) is below the supplier MOQ (${moq})`
    );
  }

  // ── Recompute total at approval-time quantity ──────────────────────────────
  const unitPrice = offer.selected_quote.unit_price;
  const quantity = approval.approved_quantity;
  const totalAmount = (unitPrice * quantity).toFixed(2);
  const unitPriceStr = unitPrice.toFixed(2);

  // ── Build human-readable item name ────────────────────────────────────────
  const itemName = `Procurement: ${offer.objective}`.slice(0, 127); // PayPal max = 127 chars
  const description =
    `Supplier: ${offer.selected_quote.supplier_name} — ` +
    `${quantity} × ${offer.currency} ${unitPriceStr}`;

  // ── Create PayPal order ───────────────────────────────────────────────────
  const paypalOrder = await createPayPalOrder({
    itemName,
    description,
    quantity,
    unitPrice: unitPriceStr,
    currency: offer.currency,
    totalAmount,
    // Use the offer_id as PayPal reference_id for idempotency and traceability.
    referenceId: offer.offer_id,
    returnUrl: resolveReturnUrl(offer.offer_id),
    cancelUrl: resolveCancelUrl(offer.offer_id),
  });

  return {
    offer_id: offer.offer_id,
    paypal_order_id: paypalOrder.id,
    paypal_order_status: paypalOrder.status,
    approval_url: paypalOrder.approvalUrl,
    created_at: new Date().toISOString(),
  };
}

/**
 * Captures a PayPal order that the buyer has already approved on PayPal.
 *
 * This must only be called AFTER the buyer has completed the PayPal checkout
 * flow (i.e. after they were redirected back from PayPal to the return URL).
 *
 * Status lifecycle: CREATED → APPROVED (buyer on PayPal) → COMPLETED (capture)
 *
 * @throws if the PayPal capture call fails or returns an unexpected status.
 */
export async function capturePayment(
  offerId: string,
  paypalOrderId: string
): Promise<ProcurementPaymentResult> {
  if (!paypalOrderId || paypalOrderId.trim().length === 0) {
    throw new Error("procurement/payment: paypalOrderId is required for capture");
  }

  const capture = await capturePayPalOrder(paypalOrderId.trim());

  return {
    offer_id: offerId,
    paypal_order_id: capture.orderId,
    paypal_order_status: capture.status,
    capture_id: capture.captureId,
    captured_amount: capture.amount,
    currency: capture.currency,
    captured_at: new Date().toISOString(),
  };
}

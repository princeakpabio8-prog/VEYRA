/**
 * app/api/procurement/capture-payment/route.ts
 *
 * POST /api/procurement/capture-payment
 *
 * Captures a PayPal order that the buyer has already approved on PayPal.
 * Must only be called AFTER the buyer has completed the PayPal checkout flow
 * (i.e. after they were redirected back from PayPal to the return URL).
 *
 * ─── Boundary ────────────────────────────────────────────────────────────────
 *
 *   This route does NOT:
 *     - Call ProcureCall or any supplier API.
 *     - Initiate a new PayPal order (use /api/procurement/initiate-payment).
 *     - Auto-capture without a prior buyer approval step on PayPal.
 *
 * ─── Request body ────────────────────────────────────────────────────────────
 *
 *   {
 *     "offer_id": string,          // The ProcurementOffer.offer_id
 *     "paypal_order_id": string    // The PayPal order ID from the PaymentIntent
 *   }
 *
 * ─── Response ────────────────────────────────────────────────────────────────
 *
 *   200  { ok: true, result: ProcurementPaymentResult }
 *   400  { ok: false, error: string }
 *   502  { ok: false, error: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { capturePayment } from "@/lib/procurement/paymentOrchestration";

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

  // ── Validate required fields ──────────────────────────────────────────────
  const offerId = input["offer_id"];
  const paypalOrderId = input["paypal_order_id"];

  if (typeof offerId !== "string" || offerId.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Missing or invalid required field: "offer_id"' },
      { status: 400 }
    );
  }

  if (typeof paypalOrderId !== "string" || paypalOrderId.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Missing or invalid required field: "paypal_order_id"' },
      { status: 400 }
    );
  }

  try {
    const result = await capturePayment(offerId.trim(), paypalOrderId.trim());
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[procurement/capture-payment]", message);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

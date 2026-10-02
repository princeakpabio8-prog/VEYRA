/**
 * app/api/paypal/capture-order/route.ts
 *
 * POST /api/paypal/capture-order
 *
 * Captures a PayPal Orders v2 order that has already been approved by the
 * buyer. Credentials and access tokens remain server-side at all times.
 *
 * Request body: { "orderId": "<PayPal order ID>" }
 *
 * Returns only safe capture metadata — no credentials, no access tokens.
 */
import { NextRequest, NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal/client";

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

  // Validate required field.
  const input = body as Record<string, unknown>;
  const orderId = input["orderId"];

  if (typeof orderId !== "string" || orderId.trim().length === 0) {
    return NextResponse.json(
      { ok: false, error: 'Missing or invalid required field: "orderId"' },
      { status: 400 }
    );
  }

  try {
    const capture = await capturePayPalOrder(orderId.trim());

    return NextResponse.json({
      ok: true,
      orderId: capture.orderId,
      status: capture.status,
      captureId: capture.captureId,
      amount: capture.amount,
      currency: capture.currency,
      links: capture.links,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Log server-side for debugging; the PayPal client already strips
    // credentials from error messages before throwing.
    console.error("[paypal/capture-order]", message);

    return NextResponse.json(
      { ok: false, error: message },
      { status: 502 }
    );
  }
}

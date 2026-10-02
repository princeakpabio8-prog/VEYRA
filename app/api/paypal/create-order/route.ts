/**
 * app/api/paypal/create-order/route.ts
 *
 * POST /api/paypal/create-order
 *
 * Development-only route for verifying end-to-end PayPal sandbox order
 * creation: VEYRA server → PayPal OAuth → Orders v2 → order ID + approval URL.
 *
 * Accepts a JSON body matching CreatePayPalOrderInput.
 * Returns only safe order metadata — no credentials, no access tokens.
 *
 * This route must be guarded or removed before production deployment.
 */
import { NextRequest, NextResponse } from "next/server";
import {
  createPayPalOrder,
  type CreatePayPalOrderInput,
} from "@/lib/paypal/client";

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

  // Validate required fields.
  const input = body as Partial<CreatePayPalOrderInput>;

  const missing: string[] = [];
  if (!input.itemName) missing.push("itemName");
  if (!input.quantity || input.quantity <= 0) missing.push("quantity");
  if (!input.unitPrice) missing.push("unitPrice");
  if (!input.currency) missing.push("currency");
  if (!input.totalAmount) missing.push("totalAmount");

  if (missing.length > 0) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields", missing },
      { status: 400 }
    );
  }

  try {
    const order = await createPayPalOrder(input as CreatePayPalOrderInput);

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      status: order.status,
      approvalUrl: order.approvalUrl,
      links: order.links,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Log server-side for debugging, but never expose credentials in the
    // message (the client utility already strips them from error text).
    console.error("[paypal/create-order]", message);

    return NextResponse.json(
      { ok: false, error: message },
      { status: 502 }
    );
  }
}

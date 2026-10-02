/**
 * app/paypal/return/actions.ts
 *
 * Server-only action: captures a PayPal Orders v2 order that the buyer
 * just approved.  Called exclusively from the return page Server Component.
 *
 * Credentials and OAuth tokens never leave the server.
 */
"use server";

import { capturePayPalOrder } from "@/lib/paypal/client";

export type CaptureState =
  | { status: "success"; orderId: string; captureId: string | null; amount: string | null; currency: string | null }
  | { status: "already_completed"; orderId: string }
  | { status: "error"; message: string };

/**
 * Captures the PayPal order identified by `orderId`.
 *
 * PayPal returns HTTP 422 with issue INSTRUMENT_DECLINED or ORDER_ALREADY_CAPTURED
 * for duplicate / already-captured orders, so we detect that and surface a
 * dedicated "already_completed" state instead of a generic error.
 */
export async function captureOrder(orderId: string): Promise<CaptureState> {
  if (!orderId || orderId.trim().length === 0) {
    return { status: "error", message: "No PayPal order ID was provided." };
  }

  try {
    const result = await capturePayPalOrder(orderId.trim());

    // PayPal may return 200 with status COMPLETED (fresh capture) or with a
    // status indicating the order was already captured.
    if (
      result.status === "COMPLETED" ||
      result.status === "APPROVED" // rare but possible on some sandbox responses
    ) {
      return {
        status: "success",
        orderId: result.orderId,
        captureId: result.captureId,
        amount: result.amount,
        currency: result.currency,
      };
    }

    // Any other non-error status (e.g. VOIDED, PAYER_ACTION_REQUIRED) is
    // treated as an unexpected failure.
    return {
      status: "error",
      message: `Unexpected order status after capture: ${result.status}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    // Detect "already captured" error from PayPal's error body text.
    if (
      message.includes("ORDER_ALREADY_CAPTURED") ||
      message.includes("TRANSACTION_ALREADY_COMPLETED") ||
      message.includes("ORDER_ALREADY_COMPLETED")
    ) {
      return { status: "already_completed", orderId: orderId.trim() };
    }

    // Strip anything that looks like a token/secret from the user-visible message.
    console.error("[paypal/return] capture failed:", message);
    return { status: "error", message };
  }
}

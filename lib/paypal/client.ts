/**
 * lib/paypal/client.ts
 *
 * Server-only PayPal integration.
 * Never import this from a client component or a NEXT_PUBLIC_ path.
 *
 * Exposes:
 *   getAccessToken()      — fetches a fresh OAuth client-credentials token
 *   createPayPalOrder()   — creates a PayPal Orders v2 order (intent: CAPTURE)
 *
 * Optional environment variables:
 *   PAYPAL_RETURN_URL     — buyer is sent here after approving payment on PayPal
 *                           (defaults to http://localhost:3000/paypal/return)
 *   PAYPAL_CANCEL_URL     — buyer is sent here if they cancel on PayPal
 *                           (defaults to http://localhost:3000/paypal/cancel)
 */

// Server-only guard — prevents accidental client-bundle inclusion.
import "server-only";

/** Milliseconds before an outbound PayPal fetch is aborted. */
const TIMEOUT_MS = 15_000;

// ─── Environment helpers ──────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.startsWith("<")) {
    throw new Error(`PayPal: required environment variable ${name} is not set`);
  }
  return value;
}

function getConfig() {
  return {
    clientId: requireEnv("PAYPAL_CLIENT_ID"),
    clientSecret: requireEnv("PAYPAL_CLIENT_SECRET"),
    baseUrl: requireEnv("PAYPAL_BASE_URL"),
  };
}

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function paypalFetch(
  url: string,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      cache: "no-store",
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// ─── OAuth token ──────────────────────────────────────────────────────────────

/**
 * Obtains a short-lived OAuth 2 client-credentials access token from PayPal.
 * The token value is kept server-side and never returned to callers.
 *
 * @internal — used only within this module.
 */
async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret, baseUrl } = getConfig();

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await paypalFetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "(unreadable)");
    throw new Error(
      `PayPal OAuth failed — HTTP ${response.status}: ${text}`
    );
  }

  const data = (await response.json()) as Record<string, unknown>;
  const token = data["access_token"];

  if (typeof token !== "string" || token.length === 0) {
    throw new Error("PayPal OAuth response did not contain an access_token");
  }

  // Token is returned only to callers within this module — never logged.
  return token;
}

// ─── Order creation ───────────────────────────────────────────────────────────

export interface CreatePayPalOrderInput {
  /** Human-readable product or service name. */
  itemName: string;
  /** Short item description. */
  description?: string;
  /** Number of units. Must be a positive integer. */
  quantity: number;
  /** Price per unit, formatted to 2 decimal places (e.g. "10.00"). */
  unitPrice: string;
  /** ISO 4217 currency code (e.g. "USD"). */
  currency: string;
  /**
   * Total order amount, formatted to 2 decimal places.
   * Must equal unitPrice × quantity for PayPal validation to pass.
   */
  totalAmount: string;
  /** Optional merchant-supplied reference for this order. */
  referenceId?: string;
  /**
   * URL the buyer is redirected to after approving payment on PayPal.
   * Falls back to PAYPAL_RETURN_URL env var, then http://localhost:3000/paypal/return.
   */
  returnUrl?: string;
  /**
   * URL the buyer is redirected to if they cancel on PayPal.
   * Falls back to PAYPAL_CANCEL_URL env var, then http://localhost:3000/paypal/cancel.
   */
  cancelUrl?: string;
}

export interface PayPalOrderResult {
  /** PayPal-assigned order ID. */
  id: string;
  /** Order status returned by PayPal (e.g. "CREATED"). */
  status: string;
  /** HATEOAS links returned by PayPal, keyed by rel. */
  links: Array<{ rel: string; href: string; method: string }>;
  /** Convenience: the "approve" HATEOAS link for buyer redirect. */
  approvalUrl: string | null;
}

/**
 * Creates a PayPal Orders v2 order with intent CAPTURE.
 *
 * @throws if credentials are missing, network fails, or PayPal returns non-2xx.
 */
export async function createPayPalOrder(
  input: CreatePayPalOrderInput
): Promise<PayPalOrderResult> {
  const { baseUrl } = getConfig();
  const token = await getAccessToken();

  const returnUrl =
    input.returnUrl ??
    process.env["PAYPAL_RETURN_URL"] ??
    "http://localhost:3000/paypal/return";

  const cancelUrl =
    input.cancelUrl ??
    process.env["PAYPAL_CANCEL_URL"] ??
    "http://localhost:3000/paypal/cancel";

  const payload = {
    intent: "CAPTURE",
    // experience_context drives the PayPal-hosted checkout page behaviour.
    // user_action: "PAY_NOW" shows a "Pay Now" button so the buyer completes
    // payment on PayPal instead of landing in an incomplete CONTINUE flow.
    payment_source: {
      paypal: {
        experience_context: {
          user_action: "PAY_NOW",
          return_url: returnUrl,
          cancel_url: cancelUrl,
          // IMMEDIATE_PAYMENT_REQUIRED keeps the order from being approved
          // without a funding instrument attached.
          payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
        },
      },
    },
    purchase_units: [
      {
        ...(input.referenceId ? { reference_id: input.referenceId } : {}),
        description: input.description ?? input.itemName,
        items: [
          {
            name: input.itemName,
            description: input.description ?? input.itemName,
            unit_amount: {
              currency_code: input.currency,
              value: input.unitPrice,
            },
            quantity: String(input.quantity),
          },
        ],
        amount: {
          currency_code: input.currency,
          value: input.totalAmount,
          breakdown: {
            item_total: {
              currency_code: input.currency,
              value: input.totalAmount,
            },
          },
        },
      },
    ],
  };

  const response = await paypalFetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `veyra-${Date.now()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "(unreadable)");
    throw new Error(
      `PayPal create order failed — HTTP ${response.status}: ${text}`
    );
  }

  const data = (await response.json()) as {
    id: string;
    status: string;
    links: Array<{ rel: string; href: string; method: string }>;
  };

  const approvalLink = data.links?.find((l) => l.rel === "approve") ?? null;

  return {
    id: data.id,
    status: data.status,
    links: data.links ?? [],
    approvalUrl: approvalLink?.href ?? null,
  };
}

// ─── Order capture ────────────────────────────────────────────────────────────

export interface PayPalCaptureResult {
  /** PayPal-assigned order ID. */
  orderId: string;
  /** Order status after capture (e.g. "COMPLETED"). */
  status: string;
  /** Capture ID from the first purchase unit's first capture. */
  captureId: string | null;
  /** Captured amount value (e.g. "10.00"). */
  amount: string | null;
  /** ISO 4217 currency code of the captured amount. */
  currency: string | null;
  /** HATEOAS links returned by PayPal, keyed by rel. */
  links: Array<{ rel: string; href: string; method: string }>;
}

/**
 * Captures a previously-created PayPal Orders v2 order.
 *
 * The buyer must have already approved the order on PayPal before this
 * is called (status transitions: CREATED → APPROVED → COMPLETED).
 *
 * @throws if credentials are missing, network fails, or PayPal returns non-2xx.
 */
export async function capturePayPalOrder(
  orderId: string
): Promise<PayPalCaptureResult> {
  const { baseUrl } = getConfig();
  const token = await getAccessToken();

  const response = await paypalFetch(
    `${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `veyra-capture-${Date.now()}`,
      },
      // Body must be empty JSON object per PayPal Orders v2 spec.
      body: "{}",
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "(unreadable)");
    throw new Error(
      `PayPal capture order failed — HTTP ${response.status}: ${text}`
    );
  }

  const data = (await response.json()) as {
    id: string;
    status: string;
    links?: Array<{ rel: string; href: string; method: string }>;
    purchase_units?: Array<{
      payments?: {
        captures?: Array<{
          id: string;
          amount?: { value: string; currency_code: string };
        }>;
      };
    }>;
  };

  // Drill into the first capture of the first purchase unit.
  const firstCapture = data.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    orderId: data.id,
    status: data.status,
    captureId: firstCapture?.id ?? null,
    amount: firstCapture?.amount?.value ?? null,
    currency: firstCapture?.amount?.currency_code ?? null,
    links: data.links ?? [],
  };
}

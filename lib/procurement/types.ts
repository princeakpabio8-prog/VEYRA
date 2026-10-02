/**
 * lib/procurement/types.ts
 *
 * Typed contract for ProcureCall procurement offers and results.
 *
 * These types define the boundary between:
 *   - The AgentExecutor layer (MockProcureCallExecutor today, RealProcureCallExecutor tomorrow)
 *   - The payment orchestration layer (lib/procurement/paymentOrchestration.ts)
 *
 * The payment layer depends ONLY on these types — it never imports from executor.ts
 * or talks to the ProcureCall API directly.
 *
 * When a RealProcureCallExecutor is built, it must produce a ProcurementOffer
 * that conforms to this contract.  No other file needs to change.
 *
 * ─── Offer/Result lifecycle ───────────────────────────────────────────────────
 *
 *   ProcureCall execution
 *     → SupplierQuote[]          (raw quotes from supplier conversations)
 *     → ProcurementOffer         (customer-facing offer, requires approval)
 *     → approval (customer)
 *     → ProcurementPaymentIntent (PayPal order created, awaiting buyer)
 *     → PayPal buyer approval
 *     → ProcurementPaymentResult (capture confirmed)
 */

// ─── Raw supplier quote ───────────────────────────────────────────────────────

/**
 * A single supplier's response from a ProcureCall conversation.
 * This is the raw data extracted from a call — real or simulated.
 */
export interface SupplierQuote {
  /** Supplier display name or phone number if name was not obtained. */
  supplier_name: string;
  /** Supplier phone number that was dialled. */
  phone: string;
  /** Duration of the call in seconds. */
  call_duration_seconds: number;
  /** Human-readable outcome of the conversation. */
  outcome: string;
  /** Minimum order quantity. */
  moq: number;
  /** Unit price in the denomination specified by `currency`. */
  unit_price: number;
  /** ISO 4217 currency code (e.g. "NGN", "USD"). */
  currency: string;
  /** Availability description (e.g. "In stock — ready to ship"). */
  availability: string;
  /** Delivery terms (e.g. "Ex-works Lagos"). */
  delivery_terms: string;
  /** Payment terms (e.g. "50% upfront, 50% on delivery"). */
  payment_terms: string;
  /** Free-text notes from the conversation. */
  notes: string;
}

// ─── Procurement offer ────────────────────────────────────────────────────────

/**
 * A procurement offer derived from one or more SupplierQuotes.
 *
 * This is the object the customer reviews and either approves or rejects.
 * It contains enough information to create a PayPal order without going
 * back to ProcureCall.
 *
 * IMPORTANT: An offer does NOT imply payment has been initiated.
 * The customer must explicitly approve before any PayPal order is created.
 */
export interface ProcurementOffer {
  /**
   * Stable identifier for this offer instance.
   * Callers should generate this (e.g. crypto.randomUUID()) so the payment
   * layer can use it as a PayPal reference_id for idempotency.
   */
  offer_id: string;

  /** The procurement objective that triggered this offer. */
  objective: string;

  /** The winning / recommended supplier quote. */
  selected_quote: SupplierQuote;

  /** All quotes gathered (may include the selected quote). */
  all_quotes: SupplierQuote[];

  /**
   * Number of units the customer wants to purchase.
   * Must be >= selected_quote.moq.
   */
  quantity: number;

  /**
   * Total price = selected_quote.unit_price × quantity.
   * Pre-computed by the executor so the payment layer does not need to re-derive it.
   * Formatted to 2 decimal places as a string (e.g. "12500.00").
   */
  total_amount: string;

  /** ISO 4217 currency code that applies to unit_price and total_amount. */
  currency: string;

  /**
   * Whether this offer was produced by a mock executor.
   * Real offers set this to false.  The payment layer surfaces this in
   * the approval UI so customers are never misled.
   */
  is_demo: boolean;

  /** ISO timestamp when the offer was generated. */
  created_at: string;
}

// ─── Payment intent (post-approval) ──────────────────────────────────────────

/**
 * Created after the customer approves a ProcurementOffer.
 * Holds the PayPal order that is waiting for the buyer to complete checkout.
 */
export interface ProcurementPaymentIntent {
  /** The offer this intent was created for. */
  offer_id: string;
  /** PayPal-assigned order ID. */
  paypal_order_id: string;
  /** PayPal order status at creation time (typically "CREATED"). */
  paypal_order_status: string;
  /** URL to redirect the buyer to for PayPal checkout. Null if unavailable. */
  approval_url: string | null;
  /** ISO timestamp when the PayPal order was created. */
  created_at: string;
}

// ─── Payment result (post-capture) ───────────────────────────────────────────

/**
 * Returned after the PayPal order has been captured (buyer completed checkout).
 */
export interface ProcurementPaymentResult {
  /** The offer this payment was for. */
  offer_id: string;
  /** PayPal-assigned order ID. */
  paypal_order_id: string;
  /** Order status after capture (e.g. "COMPLETED"). */
  paypal_order_status: string;
  /** PayPal capture ID from the first purchase unit's first capture. */
  capture_id: string | null;
  /** Captured amount (e.g. "12500.00"). */
  captured_amount: string | null;
  /** ISO 4217 currency of the captured amount. */
  currency: string | null;
  /** ISO timestamp when the capture was completed. */
  captured_at: string;
}

// ─── Executor result helper ───────────────────────────────────────────────────

/**
 * Extracts a ProcurementOffer from the raw `data` bag returned by
 * MockProcureCallExecutor (or any future ProcureCallExecutor).
 *
 * This keeps the casting logic in one place.  If the executor's output
 * shape changes, only this function needs updating.
 *
 * Returns null if the data does not contain the expected shape.
 */
export function extractProcurementOffer(
  executorData: Record<string, unknown>
): ProcurementOffer | null {
  const supplierResults = executorData["supplier_results"];
  if (!Array.isArray(supplierResults) || supplierResults.length === 0) {
    return null;
  }

  const objective = typeof executorData["objective"] === "string"
    ? executorData["objective"]
    : "Procurement";

  // Treat the first result as the recommended quote (executor already sorted by best terms).
  const raw = supplierResults[0] as Record<string, unknown>;

  // Normalise unit price — mock executor uses unit_price_ngn, real API may use unit_price + currency.
  const unitPrice: number =
    typeof raw["unit_price"] === "number"
      ? raw["unit_price"]
      : typeof raw["unit_price_ngn"] === "number"
        ? raw["unit_price_ngn"]
        : 0;

  const currency: string =
    typeof raw["currency"] === "string" ? raw["currency"] : "NGN";

  const moq: number = typeof raw["moq"] === "number" ? raw["moq"] : 1;

  const selectedQuote: SupplierQuote = {
    supplier_name: typeof raw["supplier_name"] === "string" ? raw["supplier_name"] : "Unknown Supplier",
    phone: typeof raw["phone"] === "string" ? raw["phone"] : "",
    call_duration_seconds: typeof raw["call_duration_seconds"] === "number" ? raw["call_duration_seconds"] : 0,
    outcome: typeof raw["outcome"] === "string" ? raw["outcome"] : "",
    moq,
    unit_price: unitPrice,
    currency,
    availability: typeof raw["availability"] === "string" ? raw["availability"] : "",
    delivery_terms: typeof raw["delivery_terms"] === "string" ? raw["delivery_terms"] : "",
    payment_terms: typeof raw["payment_terms"] === "string" ? raw["payment_terms"] : "",
    notes: typeof raw["notes"] === "string" ? raw["notes"] : "",
  };

  const allQuotes: SupplierQuote[] = supplierResults.map((r) => {
    const q = r as Record<string, unknown>;
    const qUnitPrice: number =
      typeof q["unit_price"] === "number"
        ? q["unit_price"]
        : typeof q["unit_price_ngn"] === "number"
          ? q["unit_price_ngn"]
          : 0;
    const qCurrency: string =
      typeof q["currency"] === "string" ? q["currency"] : "NGN";

    return {
      supplier_name: typeof q["supplier_name"] === "string" ? q["supplier_name"] : "Unknown",
      phone: typeof q["phone"] === "string" ? q["phone"] : "",
      call_duration_seconds: typeof q["call_duration_seconds"] === "number" ? q["call_duration_seconds"] : 0,
      outcome: typeof q["outcome"] === "string" ? q["outcome"] : "",
      moq: typeof q["moq"] === "number" ? q["moq"] : 1,
      unit_price: qUnitPrice,
      currency: qCurrency,
      availability: typeof q["availability"] === "string" ? q["availability"] : "",
      delivery_terms: typeof q["delivery_terms"] === "string" ? q["delivery_terms"] : "",
      payment_terms: typeof q["payment_terms"] === "string" ? q["payment_terms"] : "",
      notes: typeof q["notes"] === "string" ? q["notes"] : "",
    };
  });

  const quantity = moq; // Default to MOQ; the customer can adjust this before approval.
  const total = (unitPrice * quantity).toFixed(2);

  return {
    offer_id: crypto.randomUUID(),
    objective,
    selected_quote: selectedQuote,
    all_quotes: allQuotes,
    quantity,
    total_amount: total,
    currency,
    is_demo: executorData["demo_note"] !== undefined,
    created_at: new Date().toISOString(),
  };
}

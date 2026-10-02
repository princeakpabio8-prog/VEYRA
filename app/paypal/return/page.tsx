/**
 * app/paypal/return/page.tsx
 *
 * Server Component — handles the PayPal buyer return URL.
 *
 * PayPal redirects the buyer here after they approve payment:
 *   /paypal/return?token=ORDER_ID&PayerID=BUYER_PAYER_ID
 *
 * "token" is the PayPal order ID.  "PayerID" is read by PayPal itself during
 * the redirect and is not needed for the server-side capture call; we read it
 * from the URL only to acknowledge its presence but do not log or store it.
 *
 * The capture is performed entirely server-side before the page is sent to the
 * browser — no credentials or access tokens ever reach the client.
 */

import type { Metadata } from "next";
import { captureOrder } from "./actions";

export const metadata: Metadata = { title: "Payment Return" };

// Force dynamic so Next.js always re-runs this on every request rather than
// caching a stale capture result.
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function PayPalReturnPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // "token" is PayPal's name for the order ID on the return URL.
  const rawToken = params["token"];
  const orderId = typeof rawToken === "string" ? rawToken.trim() : "";

  // Capture happens server-side before any HTML is sent to the browser.
  const state = orderId
    ? await captureOrder(orderId)
    : { status: "error" as const, message: "No PayPal order token found in the URL." };

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundColor: "#f5f0e8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "var(--font-inter), Inter, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          backgroundColor: "#eee9e0",
          border: "1px solid #ddd6cc",
          borderRadius: "1rem",
          padding: "2.5rem 2rem",
        }}
      >
        {state.status === "success" && <SuccessView state={state} />}
        {state.status === "already_completed" && <AlreadyCompletedView state={state} />}
        {state.status === "error" && <ErrorView state={state} />}

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <a
            href="/"
            style={{
              fontSize: "13px",
              color: "#6b6460",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Return to VEYRA
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-views ────────────────────────────────────────────────────────────────

type SuccessState = {
  status: "success";
  orderId: string;
  captureId: string | null;
  amount: string | null;
  currency: string | null;
};

function SuccessView({ state }: { state: SuccessState }) {
  return (
    <>
      {/* Icon */}
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: "#d1fae5",
            border: "1.5px solid #6ee7b7",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#065f46"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      </div>

      <h1
        style={{
          textAlign: "center",
          fontSize: "1.375rem",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "#141210",
          margin: "0 0 0.5rem",
        }}
      >
        Payment successful
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: "#6b6460",
          margin: "0 0 1.75rem",
        }}
      >
        Your payment has been captured and confirmed by PayPal.
      </p>

      <div
        style={{
          backgroundColor: "#f5f0e8",
          border: "1px solid #ddd6cc",
          borderRadius: "0.625rem",
          padding: "1rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.625rem",
        }}
      >
        {state.amount && state.currency && (
          <Row
            label="Amount captured"
            value={`${state.currency} ${state.amount}`}
            strong
          />
        )}
        {state.captureId && (
          <Row label="PayPal capture ID" value={state.captureId} mono />
        )}
        <Row label="PayPal order ID" value={state.orderId} mono />
      </div>
    </>
  );
}

type AlreadyCompletedState = { status: "already_completed"; orderId: string };

function AlreadyCompletedView({ state }: { state: AlreadyCompletedState }) {
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: "#fef9c3",
            border: "1.5px solid #fde68a",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#92400e"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </span>
      </div>

      <h1
        style={{
          textAlign: "center",
          fontSize: "1.375rem",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "#141210",
          margin: "0 0 0.5rem",
        }}
      >
        Already completed
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: "#6b6460",
          margin: "0 0 1.75rem",
        }}
      >
        This payment has already been captured. No duplicate charge has been
        made.
      </p>

      <div
        style={{
          backgroundColor: "#f5f0e8",
          border: "1px solid #ddd6cc",
          borderRadius: "0.625rem",
          padding: "1rem 1.25rem",
        }}
      >
        <Row label="PayPal order ID" value={state.orderId} mono />
      </div>
    </>
  );
}

type ErrorState = { status: "error"; message: string };

function ErrorView({ state }: { state: ErrorState }) {
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
        <span
          aria-hidden="true"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            backgroundColor: "#fee2e2",
            border: "1.5px solid #fca5a5",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#991b1b"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </span>
      </div>

      <h1
        style={{
          textAlign: "center",
          fontSize: "1.375rem",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "#141210",
          margin: "0 0 0.5rem",
        }}
      >
        Payment could not be captured
      </h1>

      <p
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: "#6b6460",
          margin: "0 0 1.75rem",
        }}
      >
        Something went wrong while capturing your payment. Please contact
        support if funds were deducted.
      </p>

      <div
        style={{
          backgroundColor: "#fff1f2",
          border: "1px solid #fca5a5",
          borderRadius: "0.625rem",
          padding: "1rem 1.25rem",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#7f1d1d",
            fontFamily: "monospace",
            wordBreak: "break-word",
          }}
        >
          {state.message}
        </p>
      </div>
    </>
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Row({
  label,
  value,
  mono = false,
  strong = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: "13px", color: "#6b6460", flexShrink: 0 }}>
        {label}
      </span>
      <span
        style={{
          fontSize: strong ? "15px" : "13px",
          fontWeight: strong ? 600 : 400,
          color: "#141210",
          fontFamily: mono ? "monospace" : "inherit",
          wordBreak: "break-all",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

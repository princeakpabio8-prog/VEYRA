"use client";

/**
 * RequestAgentModal — "Request an AI employee" flow.
 *
 * Short form: description, business/workflow, interaction preference, optional details.
 * Stores in agent_requests via server action.
 */

import { useState } from "react";
import { X } from "lucide-react";
import { createAgentRequest } from "@/lib/actions/deployment";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RequestAgentModal({ open, onClose }: Props) {
  const [description, setDescription] = useState("");
  const [businessWorkflow, setBusinessWorkflow] = useState("");
  const [preference, setPreference] = useState<"voice" | "text" | "both">("both");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit() {
    if (!description.trim()) {
      setError("Please describe what you need the AI employee to do.");
      return;
    }
    if (!businessWorkflow.trim()) {
      setError("Please describe the type of business or workflow.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createAgentRequest({
      requestDescription: description.trim(),
      businessWorkflow: businessWorkflow.trim(),
      interactionPreference: preference,
      additionalDetails: additionalDetails.trim() || undefined,
    });

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 z-10 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#f5f0e8" }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-tertiary hover:text-ink transition-colors"
        >
          <X size={18} strokeWidth={2} />
        </button>

        {submitted ? (
          <div className="py-4 text-center">
            <div className="text-[2rem] mb-3">✓</div>
            <h3
              className="text-[1.3rem] font-bold text-ink mb-2"
              style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
            >
              Request received
            </h3>
            <p className="text-[0.85rem] text-ink-secondary leading-relaxed">
              We'll review your request and be in touch about building your AI employee.
            </p>
            <button
              onClick={onClose}
              className="mt-5 w-full rounded-full bg-ink px-6 py-3 text-[0.88rem] font-semibold text-ivory"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3
              className="text-[1.3rem] font-bold text-ink mb-1 pr-8"
              style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
            >
              Request an AI employee
            </h3>
            <p className="text-[0.82rem] text-ink-secondary mb-5">
              Can't find what you need? Tell us and we'll build it.
            </p>

            <div className="space-y-4">
              {/* 1. Description */}
              <div>
                <label className="block text-[0.82rem] font-semibold text-ink mb-1.5">
                  What do you need the AI employee to do? *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Follow up with leads after demo calls, qualify them, and book meetings..."
                  className="w-full rounded-xl border border-surface-border bg-ivory px-4 py-3 text-[0.85rem] text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink/20 resize-none"
                />
              </div>

              {/* 2. Business/workflow */}
              <div>
                <label className="block text-[0.82rem] font-semibold text-ink mb-1.5">
                  What type of business or workflow is it for? *
                </label>
                <input
                  type="text"
                  value={businessWorkflow}
                  onChange={(e) => setBusinessWorkflow(e.target.value)}
                  placeholder="e.g. B2B SaaS sales, debt recovery, HR onboarding..."
                  className="w-full rounded-xl border border-surface-border bg-ivory px-4 py-3 text-[0.85rem] text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </div>

              {/* 3. Interaction preference */}
              <div>
                <label className="block text-[0.82rem] font-semibold text-ink mb-2">
                  Preferred interaction
                </label>
                <div className="flex gap-2">
                  {(["voice", "text", "both"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPreference(p)}
                      className={`flex-1 rounded-xl border py-2.5 text-[0.8rem] font-medium transition-colors capitalize ${
                        preference === p
                          ? "border-ink bg-ink text-ivory"
                          : "border-surface-border bg-ivory text-ink-secondary hover:border-ink/30"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Additional details (optional) */}
              <div>
                <label className="block text-[0.82rem] font-semibold text-ink mb-1.5">
                  Additional details{" "}
                  <span className="font-normal text-ink-tertiary">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Anything else we should know..."
                  className="w-full rounded-xl border border-surface-border bg-ivory px-4 py-3 text-[0.85rem] text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink/20 resize-none"
                />
              </div>
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-[0.8rem] text-red-700">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-5 w-full rounded-full bg-ink px-6 py-3.5 text-[0.88rem] font-semibold text-ivory disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
                  Sending…
                </span>
              ) : (
                "Request employee"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

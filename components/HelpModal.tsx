"use client";

/**
 * HelpModal — Human assistance request modal.
 *
 * Philosophy: Self-service when easy. Human assistance when needed.
 * Captures a short description and stores it in support_requests via server action.
 */

import { useState } from "react";
import { X } from "lucide-react";
import { createSupportRequest } from "@/lib/actions/deployment";

interface Props {
  open: boolean;
  onClose: () => void;
  agentSlug?: string;
  deploymentId?: string;
}

export function HelpModal({ open, onClose, agentSlug, deploymentId }: Props) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit() {
    if (!description.trim()) {
      setError("Please describe what you need help with.");
      return;
    }
    setLoading(true);
    setError(null);

    const result = await createSupportRequest({
      description: description.trim(),
      agentSlug,
      deploymentId,
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
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 z-10"
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
              A VEYRA team member will be in touch to help you get set up.
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
              Get human help
            </h3>
            <p className="text-[0.82rem] text-ink-secondary mb-5">
              Tell us what you need — a team member will assist you.
            </p>

            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you need help with?"
              className="w-full rounded-xl border border-surface-border bg-ivory px-4 py-3 text-[0.88rem] text-ink placeholder:text-ink-disabled focus:outline-none focus:ring-2 focus:ring-ink/20 resize-none mb-4"
            />

            {error && (
              <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-[0.8rem] text-red-700">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-full bg-ink px-6 py-3.5 text-[0.88rem] font-semibold text-ivory disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
                  Sending…
                </span>
              ) : (
                "Request assistance"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

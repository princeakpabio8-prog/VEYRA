"use client";

/**
 * HelpButton — "Need help? Get human help"
 *
 * Renders either an inline button or a subtle link.
 * Opens HelpModal for support request submission.
 */

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { HelpModal } from "./HelpModal";

interface Props {
  agentSlug?: string;
  deploymentId?: string;
  variant?: "button" | "subtle";
}

export function HelpButton({ agentSlug, deploymentId, variant = "subtle" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "button" ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-surface-border bg-ivory px-4 py-2.5 text-[0.82rem] font-medium text-ink-secondary hover:text-ink hover:border-ink/20 transition-colors"
        >
          <HelpCircle size={15} strokeWidth={1.75} />
          Need help? Get human assistance
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-[0.8rem] text-ink-tertiary hover:text-ink-secondary transition-colors"
        >
          <HelpCircle size={14} strokeWidth={1.75} />
          Need help?
        </button>
      )}
      <HelpModal
        open={open}
        onClose={() => setOpen(false)}
        agentSlug={agentSlug}
        deploymentId={deploymentId}
      />
    </>
  );
}

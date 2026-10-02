"use client";

/**
 * RequestAgentButton — client component so it can open the modal from /agents page.
 */

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { RequestAgentModal } from "@/components/RequestAgentModal";

export function RequestAgentButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-surface-border px-5 py-4 text-left transition-colors hover:bg-surface-subtle active:bg-surface-subtle"
        style={{ backgroundColor: "#eee9e0" }}
      >
        <div className="flex-1">
          <p className="text-[0.92rem] font-semibold text-ink">Request an AI employee</p>
          <p className="text-[0.78rem] text-ink-secondary mt-0.5">Tell us what you need — we'll build it.</p>
        </div>
        <ChevronRight size={17} strokeWidth={1.75} className="text-ink-tertiary flex-shrink-0" />
      </button>
      <RequestAgentModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

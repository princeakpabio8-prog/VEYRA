"use client";

/**
 * RequestAgentSection — bottom of My AI Employees page.
 * "Can't find what you need?" and "Build an agent" paths.
 */

import { useState } from "react";
import Link from "next/link";
import { MessageSquarePlus, Hammer } from "lucide-react";
import { RequestAgentModal } from "@/components/RequestAgentModal";

export function RequestAgentSection() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className="rounded-3xl p-5 space-y-3"
        style={{ backgroundColor: "#eae4d9" }}
      >
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
          Need something different?
        </p>

        {/* Request an employee */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex w-full items-start gap-3 rounded-2xl border border-surface-border bg-ivory px-4 py-3.5 text-left hover:bg-surface-subtle transition-colors"
        >
          <MessageSquarePlus size={18} strokeWidth={1.75} className="text-ink-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[0.88rem] font-semibold text-ink leading-snug">
              Request an AI employee
            </p>
            <p className="text-[0.78rem] text-ink-secondary mt-0.5">
              Can't find what you need? We'll build it.
            </p>
          </div>
        </button>

        {/* Build an agent */}
        <Link
          href="/build"
          className="flex w-full items-start gap-3 rounded-2xl border border-surface-border bg-ivory px-4 py-3.5 text-left hover:bg-surface-subtle transition-colors"
        >
          <Hammer size={18} strokeWidth={1.75} className="text-ink-secondary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[0.88rem] font-semibold text-ink leading-snug">
              Build your own agent
            </p>
            <p className="text-[0.78rem] text-ink-secondary mt-0.5">
              Advanced: build a custom AI employee from scratch.
            </p>
          </div>
        </Link>
      </div>

      <RequestAgentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

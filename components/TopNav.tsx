"use client";

import { Search, Menu } from "lucide-react";

export function TopNav() {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-3">
      {/* Wordmark */}
      <div className="flex items-start gap-0.5">
        <span
          className="text-[2rem] font-bold leading-none tracking-[-0.03em] text-ink"
          style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
        >
          VEYRA
        </span>
        <span className="mt-1 text-[0.5rem] font-medium text-ink-secondary leading-none">™</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          aria-label="Search"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-subtle active:bg-surface-subtle"
        >
          <Search size={20} strokeWidth={1.75} />
        </button>
        <button
          aria-label="Menu"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-subtle active:bg-surface-subtle"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}

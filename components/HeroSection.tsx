import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="px-5 pt-5 pb-7">
      {/* Eyebrow */}
      <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink-secondary">
        AI Employees for your business
      </p>

      {/* Display headline */}
      <h1
        className="mb-4 text-[2.6rem] font-bold leading-[1.08] tracking-[-0.01em] text-ink"
        style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
      >
        Find an AI employee.{" "}
        <span className="block">Try it. Put it</span>
        <span className="block">to work.</span>
      </h1>

      {/* Supporting copy */}
      <p className="mb-7 text-[1rem] leading-[1.55] text-ink-secondary max-w-xs">
        Voice and AI agents that talk, think and get work done for your business.
      </p>

      {/* CTAs */}
      <div className="flex items-center gap-3">
        <Link
          href="/agents"
          className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[0.9rem] font-semibold text-ivory transition-opacity active:opacity-80"
        >
          Explore agents
          <ArrowRight size={16} strokeWidth={2} />
        </Link>
        <Link
          href="/my-employees"
          className="flex items-center gap-2 rounded-full border border-surface-border bg-transparent px-6 py-3 text-[0.9rem] font-semibold text-ink transition-colors hover:bg-surface-subtle active:bg-surface-subtle"
        >
          My employees
        </Link>
      </div>
    </section>
  );
}

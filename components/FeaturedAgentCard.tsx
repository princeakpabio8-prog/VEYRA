"use client";

import { CheckCircle2, Mic } from "lucide-react";
import { useState } from "react";

/** Animated waveform bars — pure CSS, no canvas */
function Waveform() {
  const bars = [
    { h: "h-3",   anim: "animate-wave-1" },
    { h: "h-5",   anim: "animate-wave-2" },
    { h: "h-7",   anim: "animate-wave-3" },
    { h: "h-9",   anim: "animate-wave-4" },
    { h: "h-7",   anim: "animate-wave-5" },
    { h: "h-5",   anim: "animate-wave-6" },
    { h: "h-8",   anim: "animate-wave-7" },
    { h: "h-4",   anim: "animate-wave-8" },
  ];

  return (
    <div className="flex items-center justify-center gap-[3px] h-10">
      {bars.map((b, i) => (
        <span
          key={i}
          className={`waveform-bar ${b.h} ${b.anim}`}
          style={{ backgroundColor: "rgba(20,18,16,0.25)" }}
        />
      ))}
    </div>
  );
}

/** Carousel dot indicator */
function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-3 pb-1">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === active
              ? "w-2 h-2 bg-ink"
              : "w-1.5 h-1.5 bg-ink-disabled"
          }`}
        />
      ))}
    </div>
  );
}

export function FeaturedAgentCard() {
  const [dot] = useState(0);

  return (
    <section className="px-5 pb-7">
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{ backgroundColor: "#eae4d9" }}
      >
        {/* Card inner layout: text left, portrait right */}
        <div className="flex min-h-[320px]">

          {/* Left column */}
          <div className="flex flex-col justify-between p-6 pr-2 flex-1 z-10">
            {/* Featured badge */}
            <div>
              <span className="inline-block rounded-full border border-surface-border bg-ivory px-3 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-ink-secondary mb-4">
                Featured
              </span>

              {/* Agent name */}
              <h2
                className="text-[2.4rem] font-bold leading-[1.05] tracking-[-0.01em] text-ink mb-1"
                style={{ fontFamily: "var(--font-bodoni), 'Bodoni Moda', Georgia, serif" }}
              >
                Arclio
              </h2>
              <p className="text-[0.85rem] text-ink-secondary mb-4 font-normal">
                Your AI operator.
              </p>
              <p className="text-[0.82rem] leading-[1.55] text-ink-secondary max-w-[175px]">
                Give Arclio a business task and it figures out what needs to happen and gets the work done.
              </p>
            </div>

            {/* Try button */}
            <div className="mt-5">
              <button className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[0.82rem] font-semibold text-ivory transition-opacity active:opacity-75">
                <Mic size={14} strokeWidth={2} />
                Try Arclio
              </button>
            </div>
          </div>

          {/* Right column — portrait */}
          <div className="relative w-[175px] flex-shrink-0">
            {/* Portrait placeholder — warm beige circle for the avatar */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(160deg, #e2d9c8 0%, #d4c9b5 100%)",
              }}
            />
            {/* Silhouette / avatar area */}
            <div className="absolute inset-0 flex items-start justify-center pt-4">
              <div
                className="relative w-[150px] h-[230px] rounded-[80px_80px_50%_50%] overflow-hidden"
                style={{ backgroundColor: "#c9bba5" }}
              >
                {/* Inner face oval */}
                <div
                  className="absolute left-1/2 top-[15%] -translate-x-1/2 w-[90px] h-[115px] rounded-full"
                  style={{ backgroundColor: "#b8a892" }}
                />
                {/* Neck */}
                <div
                  className="absolute left-1/2 top-[65%] -translate-x-1/2 w-[38px] h-[70px]"
                  style={{ backgroundColor: "#c2af96" }}
                />
              </div>
            </div>

            {/* Task completed badge */}
            <div className="absolute bottom-[72px] right-3 z-20">
              <div className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-card-md text-[0.72rem] font-semibold text-ink whitespace-nowrap">
                <CheckCircle2 size={14} className="text-success" strokeWidth={2.5} />
                Task completed
              </div>
            </div>

            {/* Waveform strip at bottom of portrait */}
            <div
              className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-center px-3 z-10"
              style={{ backgroundColor: "#ccc0ab" }}
            >
              <Waveform />
            </div>
          </div>
        </div>

        {/* Carousel dots */}
        <Dots count={3} active={dot} />
      </div>
    </section>
  );
}

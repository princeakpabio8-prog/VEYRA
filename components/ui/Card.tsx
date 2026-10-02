import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual lift: none = flat, sm = subtle border, md = shadow */
  elevation?: "none" | "sm" | "md";
}

const elevationClasses = {
  none: "",
  sm:   "border border-surface-border",
  md:   "border border-surface-border shadow-sm",
};

export function Card({ className, elevation = "sm", children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface p-6",
        elevationClasses[elevation],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-base font-semibold text-ink leading-snug", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-ink-secondary leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-5 flex items-center gap-3 border-t border-surface-border pt-4", className)} {...props}>
      {children}
    </div>
  );
}

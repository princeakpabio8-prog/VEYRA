import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = "default" | "success" | "warning" | "danger" | "brand";

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-surface-subtle text-ink-secondary border-surface-border",
  success: "bg-green-50  text-green-700  border-green-200",
  warning: "bg-amber-50  text-amber-700  border-amber-200",
  danger:  "bg-red-50    text-red-700    border-red-200",
  brand:   "bg-brand-50  text-brand-700  border-brand-200",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

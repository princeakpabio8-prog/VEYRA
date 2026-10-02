import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Variants ────────────────────────────────────────────────────────────────

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize    = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-ivory hover:opacity-90 active:opacity-80 shadow-sm",
  secondary:
    "bg-surface-subtle text-ink border border-surface-border hover:bg-surface-card active:bg-surface-subtle",
  ghost:
    "text-ink-secondary hover:bg-surface-subtle hover:text-ink active:bg-surface-subtle",
  danger:
    "bg-danger text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8  px-3  text-sm  gap-1.5",
  md: "h-10 px-4  text-sm  gap-2",
  lg: "h-12 px-6  text-base gap-2.5",
};

// ─── Component ───────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          // Base
          "inline-flex items-center justify-center rounded-lg font-medium",
          "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          // Variant + size
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="mr-1 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely, resolving conflicts.
 * The standard shadcn/ui cn() pattern.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

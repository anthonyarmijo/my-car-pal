import type { HTMLAttributes } from "react";
import { cn } from "../utils";

export type BadgeVariant = "neutral" | "accent" | "info" | "success" | "warning" | "danger";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return <span className={cn("mcp-badge", `mcp-badge--${variant}`, className)} {...props} />;
}

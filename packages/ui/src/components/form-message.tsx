import type { HTMLAttributes } from "react";
import { cn } from "../utils";

export type FormMessageTone = "neutral" | "error" | "success" | "warning";

export type FormMessageProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "p";
  tone?: FormMessageTone;
};

export function FormMessage({ as = "p", tone = "neutral", className, ...props }: FormMessageProps) {
  const Component = as;

  return (
    <Component
      className={cn("mcp-form-message", `mcp-form-message--${tone}`, className)}
      role={tone === "error" ? "alert" : undefined}
      {...props}
    />
  );
}

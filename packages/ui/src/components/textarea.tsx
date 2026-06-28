import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../utils";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  controlSize?: "sm" | "md" | "lg";
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { controlSize = "md", className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn("mcp-textarea", `mcp-textarea--${controlSize}`, className)} {...props} />;
});

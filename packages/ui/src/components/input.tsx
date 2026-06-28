import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  controlSize?: "sm" | "md" | "lg";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { controlSize = "md", className, ...props },
  ref,
) {
  return <input ref={ref} className={cn("mcp-input", `mcp-input--${controlSize}`, className)} {...props} />;
});

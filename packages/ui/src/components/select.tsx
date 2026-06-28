import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  controlSize?: "sm" | "md" | "lg";
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { controlSize = "md", className, children, ...props },
  ref,
) {
  return (
    <select ref={ref} className={cn("mcp-select", `mcp-select--${controlSize}`, className)} {...props}>
      {children}
    </select>
  );
});

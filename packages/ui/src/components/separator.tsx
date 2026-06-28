import type { HTMLAttributes } from "react";
import { cn } from "../utils";

export type SeparatorProps = HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
};

export function Separator({
  orientation = "horizontal",
  decorative = true,
  className,
  ...props
}: SeparatorProps) {
  return (
    <div
      className={cn("mcp-separator", `mcp-separator--${orientation}`, className)}
      role={decorative ? "presentation" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      {...props}
    />
  );
}

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils";

export type AlertVariant = "info" | "success" | "warning" | "error";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: ReactNode;
  actions?: ReactNode;
};

export function Alert({ variant = "info", title, actions, className, children, ...props }: AlertProps) {
  return (
    <div
      className={cn("mcp-alert", `mcp-alert--${variant}`, className)}
      role={variant === "error" ? "alert" : "status"}
      {...props}
    >
      <div className="mcp-alert__content">
        {title ? <p className="mcp-alert__title">{title}</p> : null}
        {children ? <div className="mcp-alert__body">{children}</div> : null}
      </div>
      {actions ? <div className="mcp-alert__actions">{actions}</div> : null}
    </div>
  );
}

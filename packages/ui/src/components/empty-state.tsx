import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils";

export type EmptyStateProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

export function EmptyState({ icon, title, description, actions, className, ...props }: EmptyStateProps) {
  return (
    <div className={cn("mcp-empty-state", className)} {...props}>
      {icon ? <div className="mcp-empty-state__icon" aria-hidden="true">{icon}</div> : null}
      <div className="mcp-empty-state__copy">
        <h2 className="mcp-empty-state__title">{title}</h2>
        {description ? <p className="mcp-empty-state__description">{description}</p> : null}
      </div>
      {actions ? <div className="mcp-empty-state__actions">{actions}</div> : null}
    </div>
  );
}

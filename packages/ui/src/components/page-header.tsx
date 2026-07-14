import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils";

export type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, description, eyebrow, actions, className, ...props }: PageHeaderProps) {
  return (
    <header className={cn("mcp-page-header", className)} {...props}>
      <div className="mcp-page-header__copy">
        {eyebrow ? <span className="mcp-page-header__eyebrow">{eyebrow}</span> : null}
        <h1 className="mcp-page-header__title">{title}</h1>
        {description ? <p className="mcp-page-header__description">{description}</p> : null}
      </div>
      {actions ? <div className="mcp-page-header__actions">{actions}</div> : null}
    </header>
  );
}

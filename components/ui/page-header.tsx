import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "@/components/ui/class-names";

type PageHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
};

export function PageHeader({ title, subtitle, eyebrow, className, ...props }: PageHeaderProps) {
  return (
    <div className={classNames("page-header-block", className)} {...props}>
      {eyebrow}
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
    </div>
  );
}

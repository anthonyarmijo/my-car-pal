import type { HTMLAttributes, ReactNode } from "react";
import { PageHeader as SharedPageHeader } from "@my-car-pal/ui";
import { classNames } from "@/components/ui/class-names";

type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, eyebrow = "Owner workspace", actions, className, ...props }: PageHeaderProps) {
  return (
    <SharedPageHeader
      className={classNames("page-header-block", className)}
      title={title}
      description={subtitle}
      eyebrow={eyebrow}
      actions={actions}
      {...props}
    />
  );
}

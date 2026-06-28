import type { HTMLAttributes, ReactNode } from "react";
import { classNames } from "@/components/ui/class-names";

type SectionTitleProps = HTMLAttributes<HTMLElement> & {
  as?: "h2" | "h3" | "span";
};

export function SectionTitle({ as = "h2", className, ...props }: SectionTitleProps) {
  const titleClassName = classNames("section-title", className);

  if (as === "h3") {
    return <h3 className={titleClassName} {...props} />;
  }

  if (as === "span") {
    return <span className={titleClassName} {...props} />;
  }

  return <h2 className={titleClassName} {...props} />;
}

type SectionSubtitleProps =
  | (HTMLAttributes<HTMLParagraphElement> & { as?: "p" })
  | (HTMLAttributes<HTMLSpanElement> & { as: "span" });

export function SectionSubtitle(props: SectionSubtitleProps) {
  const { className } = props;
  const subtitleClassName = classNames("section-subtitle", className);

  if (props.as === "span") {
    const { as: _as, className: _className, ...spanProps } = props;
    return <span className={subtitleClassName} {...spanProps} />;
  }

  const { as: _as, className: _className, ...paragraphProps } = props;
  return <p className={subtitleClassName} {...paragraphProps} />;
}

type SectionHeaderProps = HTMLAttributes<HTMLDivElement> & {
  title: ReactNode;
  subtitle?: ReactNode;
  titleAs?: SectionTitleProps["as"];
  titleClassName?: string;
  subtitleClassName?: string;
  subtitleStyle?: SectionSubtitleProps["style"];
};

export function SectionHeader({
  title,
  subtitle,
  titleAs = "h2",
  titleClassName,
  subtitleClassName,
  subtitleStyle,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={className} {...props}>
      <SectionTitle as={titleAs} className={titleClassName}>
        {title}
      </SectionTitle>
      {subtitle ? (
        <SectionSubtitle className={subtitleClassName} style={subtitleStyle}>
          {subtitle}
        </SectionSubtitle>
      ) : null}
    </div>
  );
}

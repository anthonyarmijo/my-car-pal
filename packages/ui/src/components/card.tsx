import type { ElementType, HTMLAttributes } from "react";
import { cn } from "../utils";

export type CardProps = HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "section";
  variant?: "default" | "muted" | "accent";
};

export function Card({ as = "div", variant = "default", className, ...props }: CardProps) {
  const Component = as as ElementType;

  return <Component className={cn("mcp-card", `mcp-card--${variant}`, className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mcp-card__header", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("mcp-card__title", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mcp-card__description", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mcp-card__content", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mcp-card__footer", className)} {...props} />;
}

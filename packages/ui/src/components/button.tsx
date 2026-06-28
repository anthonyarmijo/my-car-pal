import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonClassNameOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function getButtonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonClassNameOptions = {}) {
  return cn(
    "mcp-button",
    `mcp-button--${variant}`,
    `mcp-button--${size}`,
    fullWidth && "mcp-button--full",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={getButtonClassName({ variant, size, fullWidth, className })}
      {...props}
    >
      {leadingIcon ? <span className="mcp-button__icon" aria-hidden="true">{leadingIcon}</span> : null}
      <span className="mcp-button__label">{children}</span>
      {trailingIcon ? <span className="mcp-button__icon" aria-hidden="true">{trailingIcon}</span> : null}
    </button>
  );
}

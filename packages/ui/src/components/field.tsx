import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utils";
import { FormMessage } from "./form-message";

export type FieldProps = HTMLAttributes<HTMLDivElement> & {
  label?: ReactNode;
  htmlFor?: string;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
};

export function Field({
  label,
  htmlFor,
  description,
  error,
  required = false,
  className,
  children,
  ...props
}: FieldProps) {
  return (
    <div className={cn("mcp-field", className)} {...props}>
      {label ? (
        <label className="mcp-field__label" htmlFor={htmlFor}>
          <span>{label}</span>
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {children}
      {description ? <p className="mcp-field__description">{description}</p> : null}
      {error ? <FormMessage tone="error">{error}</FormMessage> : null}
    </div>
  );
}

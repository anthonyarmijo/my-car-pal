import {
  forwardRef,
  type FieldsetHTMLAttributes,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type LabelHTMLAttributes,
} from "react";
import { classNames } from "@/components/ui/class-names";

type FieldBaseProps = {
  compact?: boolean;
  inlineCompact?: boolean;
};

type FieldProps =
  | (LabelHTMLAttributes<HTMLLabelElement> & FieldBaseProps & { as?: "label" })
  | (HTMLAttributes<HTMLDivElement> & FieldBaseProps & { as: "div" });

export function Field(props: FieldProps) {
  const { compact = false, inlineCompact = false, className } = props;
  const fieldClassName = classNames("field", compact && "field-compact", inlineCompact && "field-inline-compact", className);

  if (props.as === "div") {
    const { as: _as, compact: _compact, inlineCompact: _inlineCompact, className: _className, ...divProps } = props;
    return <div className={fieldClassName} {...divProps} />;
  }

  const { as: _as, compact: _compact, inlineCompact: _inlineCompact, className: _className, ...labelProps } = props;
  return <label className={fieldClassName} {...labelProps} />;
}

type FieldGridProps = HTMLAttributes<HTMLDivElement> & {
  columns?: 2 | 3;
};

export function FieldGrid({ columns, className, ...props }: FieldGridProps) {
  return (
    <div
      className={classNames(
        "field-grid",
        columns === 2 && "field-grid-two",
        columns === 3 && "field-grid-three",
        className,
      )}
      {...props}
    />
  );
}

export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetHTMLAttributes<HTMLFieldSetElement>>(function Fieldset(
  { className, ...props },
  ref,
) {
  return <fieldset ref={ref} className={classNames("fieldset-reset", className)} {...props} />;
});

export const FormStack = forwardRef<HTMLFormElement, FormHTMLAttributes<HTMLFormElement>>(function FormStack(
  { className, ...props },
  ref,
) {
  return <form ref={ref} className={classNames("form-stack", className)} {...props} />;
});

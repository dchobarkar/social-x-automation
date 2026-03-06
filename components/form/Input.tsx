import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Optional label (rendered above the input). */
  label?: ReactNode;
  /** Optional error message (rendered below the input). */
  error?: string;
  /** Optional description or hint. */
  description?: ReactNode;
  /** Wrapper className. */
  className?: string;
  /** Input element id (for label association). */
  id?: string;
};

const inputBase =
  "w-full rounded-input border border-border bg-background px-3 py-2 text-foreground text-sm transition-colors placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed";

const Input = ({
  label,
  error,
  description,
  className = "",
  id: idProp,
  ...rest
}: InputProps) => {
  const id = idProp ?? (rest.name ? `input-${rest.name}` : undefined);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label != null && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        className={cn(inputBase, error && "border-error focus:ring-error/30")}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : description ? `${id}-desc` : undefined
        }
        {...rest}
      />

      {error && (
        <p id={id ? `${id}-error` : undefined} className="text-sm text-error">
          {error}
        </p>
      )}

      {description != null && !error && (
        <p id={id ? `${id}-desc` : undefined} className="text-xs text-muted">
          {description}
        </p>
      )}
    </div>
  );
};

export default Input;

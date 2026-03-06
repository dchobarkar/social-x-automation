import type { TextareaHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  error?: string;
  description?: ReactNode;
  className?: string;
  id?: string;
};

const textareaBase =
  "w-full rounded-input border border-border bg-background px-3 py-2 text-foreground text-sm transition-colors placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed resize-y";

const Textarea = ({
  label,
  error,
  description,
  className = "",
  id: idProp,
  ...rest
}: TextareaProps) => {
  const id = idProp ?? (rest.name ? `textarea-${rest.name}` : undefined);

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

      <textarea
        id={id}
        className={cn(
          textareaBase,
          error && "border-error focus:ring-error/30",
        )}
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

export default Textarea;

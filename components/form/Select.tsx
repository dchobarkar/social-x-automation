import type { SelectHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};
export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  /** Options: array of { value, label, disabled? } or ReactNode (e.g. <option> elements). */
  options?: SelectOption[];
  children?: ReactNode;
  /** Optional label above the select. */
  label?: ReactNode;
  /** Optional error message below. */
  error?: string;
  /** Optional description. */
  description?: ReactNode;
  className?: string;
  id?: string;
};

const selectBase =
  "w-full rounded-input border border-border bg-background px-3 py-2 pr-8 text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60 disabled:cursor-not-allowed";

const Select = ({
  options,
  children,
  label,
  error,
  description,
  className = "",
  id: idProp,
  ...rest
}: SelectProps) => {
  const id = idProp ?? (rest.name ? `select-${rest.name}` : undefined);

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

      <select
        id={id}
        className={cn(selectBase, error && "border-error focus:ring-error/30")}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${id}-error` : description ? `${id}-desc` : undefined
        }
        {...rest}
      >
        {options != null
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))
          : children}
      </select>

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

export default Select;

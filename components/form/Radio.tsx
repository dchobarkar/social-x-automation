import type { InputHTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

export type RadioProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "className"
> & {
  /** Label shown next to the radio. */
  label?: ReactNode;
  /** Description or hint below the row. */
  description?: ReactNode;
  /** Wrapper className. */
  className?: string;
  /** Input element className. */
  inputClassName?: string;
  id?: string;
};

const Radio = ({
  label,
  description,
  className = "",
  inputClassName = "",
  id: idProp,
  ...rest
}: RadioProps) => {
  const id =
    idProp ??
    (rest.name && rest.value ? `radio-${rest.name}-${rest.value}` : undefined);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-start gap-2">
        <input
          type="radio"
          id={id}
          className={cn(
            "h-4 w-4 shrink-0 border-border text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-0 disabled:opacity-60 mt-0.5",
            inputClassName,
          )}
          aria-describedby={description && id ? `${id}-desc` : undefined}
          {...rest}
        />

        {label != null && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-foreground cursor-pointer select-none"
          >
            {label}
          </label>
        )}
      </div>

      {description != null && (
        <p
          id={id ? `${id}-desc` : undefined}
          className="text-xs text-muted pl-6"
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default Radio;

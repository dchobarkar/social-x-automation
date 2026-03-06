import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

const rootClasses =
  "rounded-card border border-border bg-background text-foreground shadow-sm";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  className?: string;
  /** Optional card title (rendered in header). */
  title?: ReactNode;
  /** Optional title element. */
  titleAs?: "h1" | "h2" | "h3" | "h4";
  /** Optional description (rendered below title in header). */
  description?: ReactNode;
  /** Optional footer content (e.g. actions). */
  footer?: ReactNode;
  children?: ReactNode;
};

const Card = ({
  className = "",
  title,
  titleAs: TitleTag = "h3",
  description,
  footer,
  children,
  ...rest
}: CardProps) => {
  const hasHeader = title != null || description != null;

  return (
    <div className={cn(rootClasses, className)} {...rest}>
      {hasHeader && (
        <div className="flex flex-col gap-1.5 p-card pb-0">
          {title != null && (
            <TitleTag className="text-h3 font-semibold leading-none tracking-tight text-foreground">
              {title}
            </TitleTag>
          )}

          {description != null && (
            <p className="text-sm text-muted">{description}</p>
          )}
        </div>
      )}

      <div className="p-card">{children}</div>
      {footer != null && (
        <div className="flex items-center gap-2 p-card pt-0">{footer}</div>
      )}
    </div>
  );
};

export default Card;

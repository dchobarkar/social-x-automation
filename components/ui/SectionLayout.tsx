import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/utils/cn";

type PaddingVariant = "none" | "sm" | "default" | "lg";
type ColorVariant = "default" | "muted" | "background" | "transparent";

export type SectionLayoutProps = HTMLAttributes<HTMLElement> & {
  /** Wrapper element. */
  as?: "section" | "div" | "main" | "article";
  /** Vertical padding and horizontal padding. */
  padding?: PaddingVariant;
  /** Background and text color. */
  variant?: ColorVariant;
  /** Max width of content (e.g. max-w-2xl). Applied to inner wrapper if contentMaxWidth is set. */
  contentMaxWidth?: string;
  className?: string;
  children?: ReactNode;
};

const paddingMap: Record<PaddingVariant, string> = {
  none: "p-0",
  sm: "p-4",
  default: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};
const colorMap: Record<ColorVariant, string> = {
  default: "bg-background text-foreground",
  muted: "bg-border/50 text-foreground",
  background: "bg-background text-foreground",
  transparent: "bg-transparent text-foreground",
};

const SectionLayout = ({
  as: Tag = "section",
  padding = "default",
  variant = "default",
  contentMaxWidth,
  className = "",
  children,
  ...rest
}: SectionLayoutProps) => {
  const combined = cn(
    "w-full",
    paddingMap[padding],
    colorMap[variant],
    className,
  );

  if (contentMaxWidth) {
    return (
      <Tag className={combined} {...rest}>
        <div className={cn("mx-auto", contentMaxWidth)}>{children}</div>
      </Tag>
    );
  }

  return (
    <Tag className={combined} {...rest}>
      {children}
    </Tag>
  );
};

export default SectionLayout;

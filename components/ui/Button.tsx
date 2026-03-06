import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/utils/cn";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  /** When set, renders as Next.js Link (internal) or <a> (external). External = href starts with http or external=true. */
  href?: string;
  /** Set to true for external links (target _blank, rel noopener noreferrer). */
  external?: boolean;
  /** Icon rendered before the label/link content. */
  iconBefore?: ReactNode;
  /** Icon rendered after the label/link content. */
  iconAfter?: ReactNode;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:opacity-90 border-transparent",
  secondary: "bg-secondary text-white hover:opacity-90 border-transparent",
  outline: "border border-border bg-background text-foreground hover:bg-border",
  ghost: "text-foreground hover:bg-border border-transparent",
  destructive: "text-error hover:bg-error/10 border-transparent",
  link: "text-primary underline-offset-4 hover:underline border-transparent p-0 h-auto",
};
const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
};

const isExternal = (href: string, external?: boolean): boolean => {
  if (external === true) return true;

  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//")
  );
};

const content = (
  iconBefore?: ReactNode,
  iconAfter?: ReactNode,
  children?: ReactNode,
) => (
  <>
    {iconBefore}
    {children}
    {iconAfter}
  </>
);

const Button = ({
  variant = "primary",
  size = "default",
  className = "",
  href,
  external,
  iconBefore,
  iconAfter,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-button font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 disabled:pointer-events-none shrink-0";
  const combined = cn(
    base,
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
  const label = content(iconBefore, iconAfter, children);

  if (href != null && href !== "") {
    const externalLink = isExternal(href, external);

    if (externalLink) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combined}
        >
          {label}
        </a>
      );
    }

    return (
      <Link href={href} className={combined}>
        {label}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} className={combined} {...rest}>
      {label}
    </button>
  );
};

export default Button;

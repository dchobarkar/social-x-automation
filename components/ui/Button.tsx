import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
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
  primary:
    "border-transparent bg-primary text-white shadow-[0_12px_24px_rgba(22,93,245,0.2)] hover:-translate-y-0.5 hover:brightness-105",
  secondary:
    "border-transparent bg-secondary text-white shadow-[0_12px_24px_rgba(14,165,164,0.18)] hover:-translate-y-0.5 hover:brightness-105",
  outline:
    "border border-border bg-surface text-foreground hover:border-primary/35 hover:bg-primary/5",
  ghost: "border-transparent text-foreground hover:bg-primary/6",
  destructive: "border-transparent text-error hover:bg-error/10",
  link: "text-primary underline-offset-4 hover:underline border-transparent p-0 h-auto",
};
const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5 py-2.5 text-sm",
  sm: "h-9 px-4 text-xs",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11 p-0",
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
  onClick,
  ...rest
}: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-button border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60 disabled:pointer-events-none shrink-0";
  const combined = cn(
    base,
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
  const label = content(iconBefore, iconAfter, children);
  const linkOnClick = onClick as
    | MouseEventHandler<HTMLAnchorElement>
    | undefined;

  if (href != null && href !== "") {
    const externalLink = isExternal(href, external);

    if (externalLink) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={combined}
          onClick={linkOnClick}
        >
          {label}
        </a>
      );
    }

    return (
      <Link href={href} className={combined} onClick={linkOnClick}>
        {label}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={combined}
      onClick={onClick}
      {...rest}
    >
      {label}
    </button>
  );
};

export default Button;

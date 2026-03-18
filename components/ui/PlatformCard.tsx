import type { ReactNode } from "react";
import Link from "next/link";

import Card from "@/components/ui/Card";
import { cn } from "@/utils/cn";

export type PlatformCardProps = {
  title: string;
  description: string;
  href: string;
  /** CTA content (e.g. "Connect →" or "Coming soon →"). */
  children: ReactNode;
  /** If true, card and CTA use muted styling (e.g. for "Coming soon"). */
  muted?: boolean;
  className?: string;
};

const PlatformCard = ({
  title,
  description,
  href,
  children,
  muted = false,
  className,
}: PlatformCardProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "block focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 rounded-card",
        className,
      )}
    >
      <Card
        title={title}
        description={description}
        className={cn(
          "h-full border-white/70 bg-white/80 transition-all backdrop-blur-sm",
          muted
            ? "hover:border-border hover:bg-white"
            : "hover:-translate-y-1 hover:border-primary/30 hover:shadow-(--shadow-soft)",
        )}
      >
        <span
          className={cn(
            "text-sm font-medium",
            muted ? "text-muted" : "text-primary",
          )}
        >
          {children}
        </span>
      </Card>
    </Link>
  );
};

export default PlatformCard;

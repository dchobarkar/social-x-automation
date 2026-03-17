import type { ComponentType } from "react";
import Link from "next/link";
import { Linkedin, MessageCircle, Twitter } from "lucide-react";

import { FOOTER_PLATFORM_LINKS } from "@/constants/footer";

const PLATFORM_ICON_BY_LABEL: Record<
  (typeof FOOTER_PLATFORM_LINKS)[number]["label"],
  ComponentType<{ className?: string }>
> = {
  X: Twitter,
  LinkedIn: Linkedin,
  Reddit: MessageCircle,
};

const AuthFooter = () => {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="mx-auto p-6 md:p-8 flex flex-col gap-3 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted">
            Internal use only
          </span>
          <span className="text-muted">Developed by Darshan Chobarkar</span>
        </div>

        <nav className="flex items-center gap-2" aria-label="Platforms">
          {FOOTER_PLATFORM_LINKS.map(({ href, label }) => {
            const Icon = PLATFORM_ICON_BY_LABEL[label];
            return (
              <Link
                key={href}
                href={href}
                className="p-2 rounded-button text-muted hover:bg-border hover:text-foreground transition-colors"
                aria-label={label}
                title={label}
              >
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );
};

export default AuthFooter;

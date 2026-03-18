import type { ComponentType } from "react";
import Link from "next/link";
import { Home, Linkedin, MessageCircle, Twitter } from "lucide-react";

import { FOOTER_PLATFORM_LINKS } from "@/constants/footer";
import { ROUTES } from "@/constants/routes";

const PLATFORM_ICON_BY_LABEL: Record<
  (typeof FOOTER_PLATFORM_LINKS)[number]["label"],
  ComponentType<{ className?: string }>
> = {
  X: Twitter,
  LinkedIn: Linkedin,
  Reddit: MessageCircle,
};

const Footer = () => {
  return (
    <footer className="mt-auto border-t border-white/60 bg-white/70 backdrop-blur-xl">
      <div
        className="mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted md:px-6 lg:px-8"
        style={{ height: "var(--x-chrome-footer-h, 5.5rem)" }}
      >
        <span>© 2026. All rights reserved.</span>

        <nav
          className="flex flex-wrap items-center gap-3"
          aria-label="Platform and home links"
        >
          <Link
            href={ROUTES.HOME}
            className="p-2 rounded-button text-muted hover:bg-border hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <Home className="h-4 w-4" />
          </Link>

          {FOOTER_PLATFORM_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="p-2 rounded-button text-muted hover:bg-border hover:text-foreground transition-colors"
              aria-label={label}
            >
              {(() => {
                const Icon = PLATFORM_ICON_BY_LABEL[label];
                return <Icon className="h-4 w-4" />;
              })()}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

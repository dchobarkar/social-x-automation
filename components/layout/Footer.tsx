import Link from "next/link";
import { Home, Share2 } from "lucide-react";

import { FOOTER_PLATFORM_LINKS } from "@/constants/footer";
import { ROUTES } from "@/constants/routes";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
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
              <Share2 className="h-4 w-4" />
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;

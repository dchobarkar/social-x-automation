import Link from "next/link";
import { Home, Sparkles } from "lucide-react";

import Button from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

const AuthNavbar = () => {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto p-6 md:p-8 flex items-center justify-between gap-4">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center gap-2 text-foreground font-semibold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-button px-2 py-1 -ml-2"
          aria-label="Go to home"
        >
          <Sparkles className="h-4 w-4 text-primary shrink-0" aria-hidden />
          <span>Social Automation</span>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          href={ROUTES.HOME}
          iconBefore={<Home className="h-4 w-4" />}
        >
          Home
        </Button>
      </div>
    </header>
  );
};

export default AuthNavbar;

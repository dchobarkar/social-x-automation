import Link from "next/link";
import { Sparkles } from "lucide-react";

import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import { ROUTES } from "@/constants/routes";
import { PLATFORM_NAMES } from "@/constants/platforms";

const Page = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SectionLayout
        as="main"
        padding="lg"
        contentMaxWidth="max-w-3xl"
        className="flex flex-col items-center justify-center min-h-screen"
      >
        <h1 className="text-h1 font-bold tracking-tight flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-8 h-8 text-primary shrink-0" aria-hidden />
          Social Automation
        </h1>

        <p className="text-muted text-center mb-10 max-w-md mx-auto">
          Connect your accounts and automate replies with AI. Choose a platform
          to get started.
        </p>

        <div className="grid gap-6 w-full sm:grid-cols-3">
          <Link
            href={ROUTES.AUTH_X}
            className="block focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 rounded-card"
          >
            <Card
              title={PLATFORM_NAMES.X}
              description="Authenticate and manage your X (Twitter) feed, search, and AI replies."
              className="h-full transition-colors hover:border-primary/50 hover:shadow-md"
            >
              <span className="text-sm text-primary font-medium">
                Connect →
              </span>
            </Card>
          </Link>

          <Link
            href={ROUTES.AUTH_LINKEDIN}
            className="block focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 rounded-card"
          >
            <Card
              title={PLATFORM_NAMES.LINKEDIN}
              description="LinkedIn automation. Coming soon."
              className="h-full transition-colors hover:border-primary/50 hover:shadow-md"
            >
              <span className="text-sm text-muted font-medium">
                Coming soon →
              </span>
            </Card>
          </Link>

          <Link
            href={ROUTES.AUTH_REDDIT}
            className="block focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 rounded-card"
          >
            <Card
              title={PLATFORM_NAMES.REDDIT}
              description="Reddit automation. Coming soon."
              className="h-full transition-colors hover:border-primary/50 hover:shadow-md"
            >
              <span className="text-sm text-muted font-medium">
                Coming soon →
              </span>
            </Card>
          </Link>
        </div>
      </SectionLayout>
    </div>
  );
};

export default Page;

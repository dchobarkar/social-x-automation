import { Sparkles } from "lucide-react";

import PlatformCard from "@/components/ui/PlatformCard";
import SectionLayout from "@/components/ui/SectionLayout";
import { ROUTES } from "@/constants/routes";
import { PLATFORM_NAMES } from "@/constants/platforms";

const PLATFORMS = [
  {
    title: PLATFORM_NAMES.X,
    description:
      "Authenticate and manage your X (Twitter) feed, search, and AI replies.",
    href: ROUTES.AUTH_X,
    cta: "Connect →",
    muted: false,
  },
  {
    title: PLATFORM_NAMES.LINKEDIN,
    description: "LinkedIn automation. Coming soon.",
    href: ROUTES.AUTH_LINKEDIN,
    cta: "Coming soon →",
    muted: true,
  },
  {
    title: PLATFORM_NAMES.REDDIT,
    description: "Reddit automation. Coming soon.",
    href: ROUTES.AUTH_REDDIT,
    cta: "Coming soon →",
    muted: true,
  },
] as const;

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
          {PLATFORMS.map(({ title, description, href, cta, muted }) => (
            <PlatformCard
              key={href}
              title={title}
              description={description}
              href={href}
              muted={muted}
            >
              {cta}
            </PlatformCard>
          ))}
        </div>
      </SectionLayout>
    </div>
  );
};

export default Page;

import { PLATFORM_NAMES } from "@/constants/platforms";
import { ROUTES } from "@/constants/routes";

export const HOME_PLATFORM_CARDS = [
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

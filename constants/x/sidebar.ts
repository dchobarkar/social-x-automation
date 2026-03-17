// X dashboard sidebar nav links and platform switcher options.
import type { XNavIconKey } from "@/types/x/nav";
import { ROUTES } from "@/constants/routes";
import { PLATFORM_NAMES, PLATFORM_AUTH_ROUTES } from "@/constants/platforms";

export const X_NAV_LINKS = [
  {
    href: ROUTES.DASHBOARD_X,
    label: "Overview",
    iconKey: "dashboard" as XNavIconKey,
  },
  {
    href: ROUTES.DASHBOARD_X_FEED,
    label: "Feed",
    iconKey: "feed" as XNavIconKey,
  },
  {
    href: ROUTES.DASHBOARD_X_SEARCH,
    label: "Search",
    iconKey: "search" as XNavIconKey,
  },
] as const;

export const X_SWITCH_PLATFORMS = [
  { name: PLATFORM_NAMES.LINKEDIN, href: PLATFORM_AUTH_ROUTES.LINKEDIN },
  { name: PLATFORM_NAMES.REDDIT, href: PLATFORM_AUTH_ROUTES.REDDIT },
] as const;

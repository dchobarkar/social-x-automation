// Footer nav: platform links derived from routes and platform names.
import { ROUTES } from "@/constants/routes";
import { PLATFORM_NAMES } from "@/constants/platforms";

export const FOOTER_PLATFORM_LINKS = [
  { href: ROUTES.AUTH_X, label: PLATFORM_NAMES.X },
  { href: ROUTES.AUTH_LINKEDIN, label: PLATFORM_NAMES.LINKEDIN },
  { href: ROUTES.AUTH_REDDIT, label: PLATFORM_NAMES.REDDIT },
] as const;

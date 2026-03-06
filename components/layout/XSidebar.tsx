"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, Rss, Search } from "lucide-react";

import Button from "@/components/ui/Button";
import {
  X_NAV_LINKS,
  X_SWITCH_PLATFORMS,
  type XNavIconKey,
} from "@/constants/sidebar";
import { cn } from "@/utils/cn";

const NAV_ICONS: Record<
  XNavIconKey,
  React.ComponentType<{ className?: string }>
> = {
  dashboard: LayoutDashboard,
  feed: Rss,
  search: Search,
};

const XSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const closeSidebar = useCallback(() => setOpen(false), []);

  const handleSwitchPlatform = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const href = e.target.value;
    if (href) {
      closeSidebar();
      router.push(href);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 md:hidden flex items-center justify-center w-10 h-10 rounded-button border border-border bg-background text-foreground hover:bg-border focus:outline-none focus:ring-2 focus:ring-primary/30"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 md:hidden"
          aria-hidden
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 border-r border-border bg-background flex flex-col transition-transform duration-200 ease-out md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <span className="font-semibold text-foreground">X Dashboard</span>
          <button
            type="button"
            onClick={closeSidebar}
            className="md:hidden p-2 rounded-button text-muted hover:bg-border hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {X_NAV_LINKS.map(({ href, label, iconKey }) => {
            const isActive = pathname === href;
            const Icon = NAV_ICONS[iconKey];
            return (
              <Button
                key={href}
                variant="ghost"
                size="sm"
                href={href}
                className={cn(
                  "w-full justify-start font-medium",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-border",
                )}
                onClick={closeSidebar}
                iconBefore={
                  Icon ? <Icon className="h-4 w-4 shrink-0" /> : undefined
                }
              >
                {label}
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border py-6 min-h-22 flex flex-col justify-end">
          <p className="text-xs text-muted px-1 mb-2">Switch platform</p>

          <select
            defaultValue=""
            onChange={handleSwitchPlatform}
            className="w-full rounded-input border border-border bg-background px-3 py-2 pr-8 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none bg-no-repeat bg-size-[1rem] bg-position-[right_0.5rem_center]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            }}
            aria-label="Switch platform"
          >
            <option value="" disabled>
              Select platform…
            </option>
            {X_SWITCH_PLATFORMS.map(({ name, href }) => (
              <option key={href} value={href}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </aside>
    </>
  );
};

export default XSidebar;

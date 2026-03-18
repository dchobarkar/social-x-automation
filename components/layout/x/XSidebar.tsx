"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LayoutDashboard, Rss, Search } from "lucide-react";

import type { XNavIconKey } from "@/types/x/nav";
import Button from "@/components/ui/Button";
import Select from "@/components/form/Select";
import { X_NAV_LINKS, X_SWITCH_PLATFORMS } from "@/constants/x/sidebar";
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

  const handleSwitchPlatform = (value: string) => {
    const href = value;
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
        className="glass-panel soft-ring fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-button border border-white/60 text-foreground md:hidden"
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
          "glass-panel fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-white/60 transition-transform duration-200 ease-out md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex min-h-(--x-chrome-header-h) items-center justify-between border-b border-border/70 px-5 py-4">
          <span className="text-lg font-semibold text-foreground">
            X Workspace
          </span>
          <button
            type="button"
            onClick={closeSidebar}
            className="md:hidden p-2 rounded-button text-muted hover:bg-border hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-5">
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
                  "h-11 w-full justify-start rounded-2xl px-4 text-sm font-medium",
                  isActive
                    ? "border-primary/10 bg-primary text-white shadow-[0_12px_24px_rgba(22,93,245,0.2)]"
                    : "border-transparent text-foreground hover:bg-white/80",
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

        <div className="flex h-(--x-chrome-footer-h) flex-col justify-center border-t border-border/70 px-5 py-4">
          <Select
            name="switch-platform"
            defaultValue=""
            onChange={(e) => handleSwitchPlatform(e.target.value)}
            options={[
              { value: "", label: "Select platform…", disabled: true },
              ...X_SWITCH_PLATFORMS.map(({ name, href }) => ({
                value: href,
                label: name,
              })),
            ]}
            aria-label="Switch platform"
          />
        </div>
      </aside>
    </>
  );
};

export default XSidebar;

import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import XDashboardFlashClient from "@/components/layout/x/XDashboardFlashClient";
import Footer from "@/components/layout/Footer";
import XNavbar from "@/components/layout/x/XNavbar";
import XSidebar from "@/components/layout/x/XSidebar";
import { ROUTES } from "@/constants/routes";
import { getXConnectedStatus } from "@/services/x/auth.service";

export type XDashboardLayoutShellProps = {
  children: ReactNode;
  signOutAction: () => Promise<void>;
};

const XDashboardLayoutShell = async ({
  children,
  signOutAction,
}: XDashboardLayoutShellProps) => {
  const { connected } = await getXConnectedStatus();
  if (!connected) redirect(ROUTES.AUTH_X);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <XSidebar />

      <main className="relative flex min-h-screen flex-1 flex-col md:pl-72">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-48 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <XNavbar signOutAction={signOutAction} />

        <div className="relative z-10 px-4 pt-4 md:px-6 lg:px-8">
          <XDashboardFlashClient />
        </div>

        <div className="relative z-10 flex-1 px-4 pb-6 pt-4 md:px-6 lg:px-8">
          {children}
        </div>

        <Footer />
      </main>
    </div>
  );
};

export default XDashboardLayoutShell;

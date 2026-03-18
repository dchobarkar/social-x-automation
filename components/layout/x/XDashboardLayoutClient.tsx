import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import Footer from "@/components/layout/Footer";
import XDashboardFlashClient from "@/components/layout/x/XDashboardFlashClient";
import XNavbar from "@/components/layout/x/XNavbar";
import XSidebar from "@/components/layout/x/XSidebar";
import { ROUTES } from "@/constants/routes";
import { getXConnectedStatus } from "@/services/x/auth.service";

export type XDashboardLayoutClientProps = {
  children: ReactNode;
  signOutAction: () => Promise<void>;
};

const XDashboardLayoutClient = async ({
  children,
  signOutAction,
}: XDashboardLayoutClientProps) => {
  const { connected } = await getXConnectedStatus();
  if (!connected) redirect(ROUTES.AUTH_X);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <XSidebar />

      <main className="flex-1 flex flex-col md:pl-64 min-h-screen">
        <XNavbar signOutAction={signOutAction} />

        <XDashboardFlashClient />

        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>

        <Footer />
      </main>
    </div>
  );
};

export default XDashboardLayoutClient;

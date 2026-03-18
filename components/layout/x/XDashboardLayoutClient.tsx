"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Footer from "@/components/layout/Footer";
import XNavbar from "@/components/layout/x/XNavbar";
import XSidebar from "@/components/layout/x/XSidebar";
import FlashMessageBar from "@/components/ui/FlashMessageBar";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ROUTES } from "@/constants/routes";
import { useXConnectedStatus } from "@/hooks/useXConnectedStatus";
import { useQueryFlashMessage } from "@/hooks/useQueryFlashMessage";

export type XDashboardLayoutClientProps = {
  children: ReactNode;
};

const XDashboardLayoutClient = ({ children }: XDashboardLayoutClientProps) => {
  const router = useRouter();
  const { connected } = useXConnectedStatus();
  const flashMessage = useQueryFlashMessage({
    successMessage: "X account connected successfully.",
    onConsume: () => {
      window.history.replaceState({}, "", ROUTES.DASHBOARD_X);
    },
  });

  const handleSignOut = async () => {
    try {
      await fetch(ROUTES.API_AUTH_X_SIGNOUT, { method: "POST" });
    } finally {
      router.replace(ROUTES.HOME);
    }
  };

  useEffect(() => {
    if (connected === false) {
      router.replace(ROUTES.AUTH_X);
    }
  }, [connected, router]);

  if (connected === null) return <LoadingScreen />;
  if (connected === false)
    return <LoadingScreen message="Redirecting to connect page…" />;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <XSidebar />

      <main className="flex-1 flex flex-col md:pl-64 min-h-screen">
        <XNavbar onSignOut={handleSignOut} />

        <FlashMessageBar
          message={flashMessage}
          className="mx-4 mt-4 md:mx-6 md:mt-6 text-sm"
        />

        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>

        <Footer />
      </main>
    </div>
  );
};

export default XDashboardLayoutClient;

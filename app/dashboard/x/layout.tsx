"use client";

import { useRouter } from "next/navigation";

import XSidebar from "@/components/layout/XSidebar";
import Footer from "@/components/layout/Footer";
import FlashMessageBar from "@/components/dashboard/FlashMessageBar";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ROUTES } from "@/constants/routes";
import { useXConnectedStatus } from "@/hooks/useXConnectedStatus";
import { useQueryFlashMessage } from "@/hooks/useQueryFlashMessage";
import { cn } from "@/utils/cn";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const router = useRouter();
  const { connected } = useXConnectedStatus();
  const flashMessage = useQueryFlashMessage({
    successMessage: "X account connected successfully.",
    onConsume: () => {
      window.history.replaceState({}, "", ROUTES.DASHBOARD_X);
    },
  });

  if (connected === null) return <LoadingScreen />;

  if (connected === false) {
    router.replace(ROUTES.AUTH_X);
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <XSidebar />

      <main
        className={cn(
          "flex-1 flex flex-col pt-16 md:pt-6 md:pl-64",
          "min-h-screen",
        )}
      >
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

export default Layout;

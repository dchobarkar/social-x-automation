"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import XSidebar from "@/components/layout/XSidebar";
import Footer from "@/components/layout/Footer";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [flashMessage, setFlashMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(ROUTES.API_AUTH_X_STATUS);
      const data = await res.json();
      setAllowed(data.connected === true);
    } catch {
      setAllowed(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (allowed === false) router.replace(ROUTES.AUTH_X);
  }, [allowed, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const success = params.get("success");
    if (error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlashMessage({ type: "error", text: decodeURIComponent(error) });
      window.history.replaceState({}, "", ROUTES.DASHBOARD_X);
    } else if (success) {
      setFlashMessage({
        type: "success",
        text: "X account connected successfully.",
      });
      window.history.replaceState({}, "", ROUTES.DASHBOARD_X);
    }
  }, []);

  if (allowed === null)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Loading…</p>
      </div>
    );

  if (allowed === false) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <XSidebar />

      <main
        className={cn(
          "flex-1 flex flex-col pt-16 md:pt-6 md:pl-64",
          "min-h-screen",
        )}
      >
        {flashMessage && (
          <div
            role="alert"
            className={cn(
              "mx-4 mt-4 md:mx-6 md:mt-6 rounded-card p-4 text-sm",
              flashMessage.type === "success"
                ? "bg-success/10 text-success"
                : "bg-error/10 text-error",
            )}
          >
            {flashMessage.text}
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 lg:p-8">{children}</div>

        <Footer />
      </main>
    </div>
  );
};

export default Layout;

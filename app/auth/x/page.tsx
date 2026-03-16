"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import AuthPageLayout from "@/components/layout/AuthPageLayout";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ROUTES } from "@/constants/routes";

const Page = () => {
  const router = useRouter();
  const [connected, setConnected] = useState<boolean | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(ROUTES.API_AUTH_X_STATUS);
      const data = await res.json();
      setConnected(data.connected === true);
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (connected === true) router.replace(ROUTES.DASHBOARD_X);
  }, [connected, router]);

  const handleConnect = () => {
    window.location.href = ROUTES.API_AUTH_X_OAUTH;
  };

  if (connected === null) {
    return <LoadingScreen message="Checking authentication…" />;
  }

  if (connected === true) return null;

  return (
    <AuthPageLayout
      title="Connect X (Twitter)"
      description="Sign in with X (OAuth 2.0) to use the dashboard: load your home feed, search tweets, and post AI-generated replies."
      homeHref={ROUTES.HOME}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          You will be redirected to X to authorize this app. After connecting,
          you can access the X dashboard.
        </p>
        <Button onClick={handleConnect} type="button">
          Connect X Account
        </Button>
      </div>
    </AuthPageLayout>
  );
};

export default Page;

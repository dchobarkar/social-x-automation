"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ROUTES } from "@/constants/routes";
import { Home } from "lucide-react";

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
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <p className="text-muted">Checking authentication…</p>
      </div>
    );
  }

  if (connected === true) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="p-6 md:p-8 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          href={ROUTES.HOME}
          iconBefore={<Home className="h-4 w-4" />}
        >
          Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Card
            title="Connect X (Twitter)"
            description="Sign in with X (OAuth 2.0) to use the dashboard: load your home feed, search tweets, and post AI-generated replies."
          >
            <div className="space-y-4">
              <p className="text-sm text-muted">
                You will be redirected to X to authorize this app. After
                connecting, you can access the X dashboard.
              </p>
              <Button onClick={handleConnect} type="button">
                Connect X Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;

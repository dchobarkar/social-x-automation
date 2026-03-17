"use client";

import { useRouter } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ROUTES } from "@/constants/routes";
import { useXConnectedStatus } from "@/hooks/useXConnectedStatus";

const Page = () => {
  const router = useRouter();
  const { connected } = useXConnectedStatus();
  if (connected === true) {
    router.replace(ROUTES.DASHBOARD_X);
    return null;
  }

  const handleConnect = () => {
    window.location.href = ROUTES.API_AUTH_X_OAUTH;
  };

  if (connected === null) {
    return <LoadingScreen message="Checking authentication…" />;
  }

  return (
    <Card
      title="Connect X (Twitter)"
      description="Sign in with X (OAuth 2.0) to use the dashboard: load your home feed, search tweets, and post AI-generated replies."
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
    </Card>
  );
};

export default Page;

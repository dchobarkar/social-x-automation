import { redirect } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ROUTES } from "@/constants/routes";
import { getXConnectedStatus } from "@/services/x/auth.service";

const Page = async () => {
  const { connected } = await getXConnectedStatus();
  if (connected) redirect(ROUTES.DASHBOARD_X);

  return (
    <Card
      title="Connect X (Twitter)"
      description="Sign in with X (OAuth 2.0) to use the dashboard."
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          You will be redirected to X to authorize this app. After connecting,
          you can access the X dashboard.
        </p>

        <Button href={ROUTES.API_AUTH_X_OAUTH}>Connect X Account</Button>
      </div>
    </Card>
  );
};

export default Page;

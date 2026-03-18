import { redirect } from "next/navigation";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ROUTES } from "@/constants/routes";
import { getXConnectedStatus } from "@/services/x/auth.service";

const Page = async () => {
  const { connected } = await getXConnectedStatus();
  if (connected) redirect(ROUTES.DASHBOARD_X);

  return (
    <div className="mx-auto max-w-3xl">
      <Card
        title="Connect X (Twitter)"
        description="Sign in once, then manage your reply drafting workflow from a cleaner dashboard."
        className="border-white/70 bg-white/80 shadow-(--shadow-soft) backdrop-blur-xl"
      >
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              "Authorize your X account",
              "Pull your home feed into the workspace",
              "Generate replies before opening X",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-3xl border border-border/70 bg-surface p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/75">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {item}
                </p>
              </div>
            ))}
          </div>

          <p className="max-w-2xl text-sm leading-6 text-muted">
            You will be redirected to X to approve access. After that, the app
            keeps the workflow local: review posts, draft replies, validate
            them, and only jump into X when you are ready to publish.
          </p>

          <Button href={ROUTES.API_AUTH_X_OAUTH} size="lg">
            Connect X Account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Page;

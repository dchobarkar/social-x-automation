"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import { ROUTES } from "@/constants/routes";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const Page = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SectionLayout
        as="main"
        padding="lg"
        contentMaxWidth="max-w-3xl"
        className="flex min-h-screen items-center justify-center"
      >
        <Card
          title="Something went wrong"
          description="An unexpected error occurred. You can try again or return home."
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-muted">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              <span className="text-sm">
                If this keeps happening, check the server logs for details.
              </span>
            </div>

            {error?.digest && (
              <p className="text-xs text-muted">
                Error digest: <span className="font-mono">{error.digest}</span>
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={reset}
                iconBefore={<RotateCcw className="h-4 w-4" />}
              >
                Try again
              </Button>
              <Button href={ROUTES.HOME} variant="outline">
                Go home
              </Button>
            </div>
          </div>
        </Card>
      </SectionLayout>
    </div>
  );
};

export default Page;

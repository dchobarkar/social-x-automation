import { SearchX } from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import { ROUTES } from "@/constants/routes";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SectionLayout
        as="main"
        padding="lg"
        contentMaxWidth="max-w-3xl"
        className="flex min-h-screen items-center justify-center"
      >
        <Card
          title="Page not found"
          description="The page you’re looking for doesn’t exist (or moved)."
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-muted">
              <SearchX className="h-4 w-4" aria-hidden />
              <span className="text-sm">
                Check the URL, or go back to a known page.
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button href={ROUTES.HOME} variant="primary">
                Go home
              </Button>
              <Button href={ROUTES.DASHBOARD_X} variant="outline">
                X dashboard
              </Button>
            </div>
          </div>
        </Card>
      </SectionLayout>
    </div>
  );
};

export default NotFound;

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { ROUTES } from "@/constants/routes";
import { PLATFORM_NAMES } from "@/constants/platforms";
import { Home } from "lucide-react";

const Page = () => {
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
            title={PLATFORM_NAMES.REDDIT}
            description="Reddit authentication and dashboard are not available yet."
          >
            <div className="space-y-4">
              <p className="text-sm text-muted">
                We are working on Reddit support. Check back later.
              </p>
              <Button variant="outline" href={ROUTES.HOME}>
                Back to Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Page;

import Button from "@/components/ui/Button";
import AuthPageLayout from "@/components/layout/AuthPageLayout";
import { ROUTES } from "@/constants/routes";
import { PLATFORM_NAMES } from "@/constants/platforms";

const Page = () => {
  return (
    <AuthPageLayout
      title={PLATFORM_NAMES.LINKEDIN}
      description="LinkedIn authentication and dashboard are not available yet."
      homeHref={ROUTES.HOME}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          We are working on LinkedIn support. Check back later.
        </p>
        <Button variant="outline" href={ROUTES.HOME}>
          Back to Home
        </Button>
      </div>
    </AuthPageLayout>
  );
};

export default Page;

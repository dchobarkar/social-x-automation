import Card from "@/components/ui/Card";
import { PLATFORM_NAMES } from "@/constants/platforms";

const Page = () => {
  return (
    <Card
      title={PLATFORM_NAMES.REDDIT}
      description="Reddit authentication and dashboard are not available yet."
    >
      <div className="space-y-4">
        <p className="text-sm text-muted">
          We are working on Reddit support. Check back later.
        </p>
      </div>
    </Card>
  );
};

export default Page;

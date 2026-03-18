import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import { ROUTES } from "@/constants/routes";

const Page = () => {
  return (
    <SectionLayout
      padding="none"
      variant="transparent"
      as="div"
      className="flex-1 flex flex-col items-center justify-center min-h-0"
    >
      <PageHeader
        title="X Dashboard"
        description="Manage your X home feed and generate AI reply drafts for manual posting on X."
        className="text-center mb-6"
      />

      <div className="grid gap-4 sm:grid-cols-2 w-full max-w-2xl">
        <Card
          title="Feed"
          description="Load your home timeline and generate AI reply drafts you can review before opening in X."
          footer={
            <Button size="sm" href={ROUTES.DASHBOARD_X_FEED}>
              Open Feed
            </Button>
          }
        >
          <p className="text-sm text-muted">
            Tweets are stored in data/x/feed.json. You can filter by time,
            exclude replies/retweets, and set min author followers.
          </p>
        </Card>

        <Card
          title="Search"
          description="Keyword search is being redesigned and will return later."
          footer={
            <Button size="sm" href={ROUTES.DASHBOARD_X_SEARCH}>
              View Placeholder
            </Button>
          }
        >
          <p className="text-sm text-muted">
            The future search flow will focus on draft generation and manual
            posting through X.
          </p>
        </Card>
      </div>
    </SectionLayout>
  );
};

export default Page;

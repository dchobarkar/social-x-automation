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
        description="Manage your X (Twitter) feed, search tweets, and post AI-generated replies."
        className="text-center mb-6"
      />

      <div className="grid gap-4 sm:grid-cols-2 w-full max-w-2xl">
        <Card
          title="Feed"
          description="Load your home timeline and reply to tweets with AI-generated options."
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
          description="Search tweets by keyword and generate reply variants with OpenAI."
          footer={
            <Button size="sm" href={ROUTES.DASHBOARD_X_SEARCH}>
              Open Search
            </Button>
          }
        >
          <p className="text-sm text-muted">
            Search results are stored in data/x/search.json. Generate Humorous
            and Insightful replies, then post or open in X.
          </p>
        </Card>
      </div>
    </SectionLayout>
  );
};

export default Page;

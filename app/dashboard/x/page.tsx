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
      className="flex min-h-0 flex-1 flex-col justify-center"
    >
      <div className="mx-auto w-full max-w-5xl rounded-4xl border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft) backdrop-blur-xl md:p-8">
        <PageHeader
          title="X Dashboard"
          description="Move through the workflow with minimal friction: load your feed, draft in context, and only open X when you are ready to publish."
          className="mb-8"
        />

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {[
            "Filter for fresher or higher-signal posts",
            "Generate AI reply drafts in the same workspace",
            "Open X only when the reply is ready",
          ].map((item, index) => (
            <div
              key={item}
              className="rounded-3xl border border-border/70 bg-surface p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/75">
                Step {index + 1}
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{item}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card
            title="Feed"
            description="Load your home timeline and generate AI reply drafts you can review before opening in X."
            footer={
              <Button size="sm" href={ROUTES.DASHBOARD_X_FEED}>
                Open Feed
              </Button>
            }
          >
            <p className="text-sm leading-6 text-muted">
              Tweets are stored in `data/x/feed.json`. You can filter by time,
              exclude replies or reposts, and bias toward higher reach authors.
            </p>
          </Card>

          <Card
            title="Search"
            description="Run recent search with query building, review candidates, and generate reply drafts in the same workspace."
            footer={
              <Button size="sm" href={ROUTES.DASHBOARD_X_SEARCH}>
                Open Search
              </Button>
            }
          >
            <p className="text-sm leading-6 text-muted">
              Build queries from keywords, phrases, usernames, and hashtags,
              then page through recent results while keeping the same
              draft-first writing flow as feed.
            </p>
          </Card>
        </div>
      </div>
    </SectionLayout>
  );
};

export default Page;

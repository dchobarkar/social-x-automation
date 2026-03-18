import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";

const SearchPage = () => {
  return (
    <SectionLayout padding="none" variant="transparent" as="div">
      <div className="mx-auto max-w-4xl rounded-4xl border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft) backdrop-blur-xl md:p-8">
        <PageHeader
          title="Search"
          description="Keyword search is being redesigned so it fits the same low-friction drafting flow as the feed workspace."
        />

        <Card
          title="Coming Soon"
          description="Search will return once it can support better candidate discovery, triage, and draft generation."
        >
          <div className="space-y-4 text-sm text-muted">
            <p>Right now, the supported X workflow is:</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "connect your X account",
                "load posts from your home feed",
                "generate AI reply drafts locally",
                "open X manually when you are ready to post",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-3xl border border-border/70 bg-surface-strong p-4"
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
          </div>
        </Card>
      </div>
    </SectionLayout>
  );
};

export default SearchPage;

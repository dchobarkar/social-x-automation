import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";

const SearchPage = () => {
  return (
    <SectionLayout padding="none" variant="transparent" as="div">
      <PageHeader
        title="Search"
        description="Keyword search is being redesigned and will return in a later version."
      />

      <Card
        title="Coming Soon"
        description="We are reworking X search so it better fits the draft-first workflow for this project."
      >
        <div className="space-y-3 text-sm text-muted">
          <p>For now, the supported X flow is:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>connect your X account</li>
            <li>load posts from your home feed</li>
            <li>generate AI reply drafts locally</li>
            <li>open X manually when you are ready to post</li>
          </ul>
        </div>
      </Card>
    </SectionLayout>
  );
};

export default SearchPage;

import XFeedPageClient from "@/components/dashboard/x/XFeedPageClient";
import { getSavedFeed } from "@/lib/storage/feedStore";

const Page = async () => {
  const initialItems = await getSavedFeed();

  return <XFeedPageClient initialItems={initialItems} />;
};

export default Page;

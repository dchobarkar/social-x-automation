import XFeedDashboardClient from "@/components/dashboard/x/XFeedDashboardClient";
import { getSavedFeed } from "@/lib/storage/feedStore";

const Page = async () => {
  const initialItems = await getSavedFeed();

  return <XFeedDashboardClient initialItems={initialItems} />;
};

export default Page;

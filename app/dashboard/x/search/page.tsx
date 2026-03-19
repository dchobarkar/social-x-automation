import XSearchDashboardClient from "@/components/dashboard/x/XSearchDashboardClient";
import { getSavedSearch } from "@/lib/storage/searchStore";

const SearchPage = async () => {
  const initialItems = await getSavedSearch();

  return <XSearchDashboardClient initialItems={initialItems} />;
};

export default SearchPage;

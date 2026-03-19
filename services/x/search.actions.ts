"use server";

import type { StoredTweet } from "@/types/x/tweet";
import type { XSearchFilters } from "@/types/x/search";
import { saveSearch } from "@/lib/storage/searchStore";
import { searchXPosts } from "@/services/x/search.service";

export const loadXSearchAction = async (filters: XSearchFilters) => {
  return searchXPosts({
    ...filters,
    maxResults:
      typeof filters.maxResults === "number"
        ? Math.min(Math.max(filters.maxResults, 10), 100)
        : undefined,
  });
};

export const saveXSearchItemsAction = async (items: StoredTweet[]) => {
  await saveSearch(items);
};

import type {
  SearchPostsParams,
  SearchPostsResult,
  XSearchFilters,
} from "@/types/x/search";
import { searchRecentPosts } from "@/integrations/x/search";
import { buildSearchQuery, hasStandaloneSearchClause } from "@/utils/xSearch";

export const searchPosts = async (
  params: SearchPostsParams,
): Promise<SearchPostsResult> => {
  if (!params.query.trim()) throw new Error("Search query cannot be empty.");

  return searchRecentPosts(params);
};

export const searchXPosts = async (
  filters: XSearchFilters,
): Promise<SearchPostsResult & { query: string }> => {
  if (!hasStandaloneSearchClause(filters))
    throw new Error(
      "Add at least one keyword, exact phrase, username, or hashtag before searching. Filters like English only or verified only cannot run by themselves.",
    );

  const query = buildSearchQuery(filters);
  if (!query)
    throw new Error(
      "Add at least one keyword, exact phrase, username, or hashtag to search.",
    );

  const result = await searchPosts({
    query,
    maxResults: filters.maxResults,
    nextToken: filters.nextToken,
    sortOrder: filters.sortOrder,
  });

  return {
    ...result,
    query,
  };
};

import type { FeedFilters } from "@/types/x/feed";
import type { XTweetWithMetrics } from "@/types/x/api";
import { getMe } from "@/integrations/x/me";
import { getHomeTimeline } from "@/integrations/x/timeline";

export const getHomeFeed = async (
  filters: FeedFilters,
): Promise<{ posts: XTweetWithMetrics[]; nextToken?: string }> => {
  const me = await getMe();
  const { posts, nextToken } = await getHomeTimeline(me.id, {
    maxResults: filters.maxResults ?? 20,
    startTime: filters.startTime,
    endTime: filters.endTime,
    sinceId: filters.sinceId,
    excludeReplies: filters.excludeReplies ?? true,
    excludeRetweets: filters.excludeRetweets ?? true,
    paginationToken: filters.paginationToken,
  });

  let result = posts;
  if (filters.englishOnly) {
    result = result.filter((t) => (t.lang ?? "").toLowerCase() === "en");
  }
  if (typeof filters.maxReplyCount === "number") {
    result = result.filter(
      (t) => (t.public_metrics?.reply_count ?? 0) <= filters.maxReplyCount!,
    );
  }
  if (typeof filters.minAuthorFollowers === "number") {
    result = result.filter(
      (t) =>
        (t.author_metrics?.followers_count ?? 0) >= filters.minAuthorFollowers!,
    );
  }

  return {
    posts: result,
    nextToken,
  };
};

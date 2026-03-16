import { getMe } from "@/integrations/x/me";
import { getHomeTimeline } from "@/integrations/x/timeline";
import type { XTweetWithMetrics } from "@/integrations/x/types";

export type FeedFilters = {
  maxResults?: number;
  startTime?: string;
  endTime?: string;
  excludeReplies?: boolean;
  excludeRetweets?: boolean;
  maxReplyCount?: number;
  minAuthorFollowers?: number;
};

export const getHomeFeed = async (
  filters: FeedFilters,
): Promise<XTweetWithMetrics[]> => {
  const me = await getMe();
  const tweets = await getHomeTimeline(me.id, {
    maxResults: filters.maxResults ?? 20,
    startTime: filters.startTime,
    endTime: filters.endTime,
    excludeReplies: filters.excludeReplies ?? true,
    excludeRetweets: filters.excludeRetweets ?? true,
  });

  let result = tweets;
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
  return result;
};

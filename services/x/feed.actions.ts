"use server";

import type { FeedFilters } from "@/types/x/feed";
import type { StoredTweet } from "@/types/x/tweet";
import { saveFeed } from "@/lib/storage/feedStore";
import { getHomeFeed } from "@/services/x/feed.service";

export const loadXFeedAction = async (
  filters: FeedFilters & { lastHours?: number },
) => {
  const nextFilters: FeedFilters = {
    maxResults:
      typeof filters.maxResults === "number"
        ? Math.min(Math.max(filters.maxResults, 1), 100)
        : 20,
    excludeReplies: filters.excludeReplies,
    excludeRetweets: filters.excludeRetweets,
    maxReplyCount: filters.maxReplyCount,
    minAuthorFollowers: filters.minAuthorFollowers,
    startTime: filters.startTime,
    endTime: filters.endTime,
  };

  if (
    typeof filters.lastHours === "number" &&
    Number.isFinite(filters.lastHours)
  ) {
    const d = new Date();
    d.setHours(d.getHours() - filters.lastHours);
    nextFilters.startTime = d.toISOString();
  }

  return getHomeFeed(nextFilters);
};

export const saveXFeedItemsAction = async (items: StoredTweet[]) => {
  await saveFeed(items);
};

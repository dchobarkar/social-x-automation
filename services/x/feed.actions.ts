"use server";

import type { FeedFilters } from "@/types/x/feed";
import type { StoredTweet } from "@/types/x/tweet";
import { saveFeed } from "@/lib/storage/feedStore";
import { getHomeFeed } from "@/services/x/feed.service";

export const loadXFeedAction = async (
  filters: FeedFilters & { lastHours?: number; paginationToken?: string },
) => {
  const nextFilters: FeedFilters = {
    maxResults:
      typeof filters.maxResults === "number"
        ? Math.min(Math.max(filters.maxResults, 1), 100)
        : 20,
    excludeReplies: filters.excludeReplies,
    excludeRetweets: filters.excludeRetweets,
    englishOnly: filters.englishOnly,
    maxReplyCount: filters.maxReplyCount,
    minAuthorFollowers: filters.minAuthorFollowers,
    startTime: filters.startTime,
    endTime: filters.endTime,
    sinceId: filters.sinceId,
    paginationToken: filters.paginationToken,
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

/**
 * X feed filters (home timeline).
 * Used by feed service and API route.
 */
export type FeedFilters = {
  maxResults?: number;
  startTime?: string;
  endTime?: string;
  sinceId?: string;
  excludeReplies?: boolean;
  excludeRetweets?: boolean;
  englishOnly?: boolean;
  maxReplyCount?: number;
  minAuthorFollowers?: number;
  paginationToken?: string;
};

/**
 * X feed filters (home timeline).
 * Used by feed service and API route.
 */
export type FeedFilters = {
  maxResults?: number;
  startTime?: string;
  endTime?: string;
  excludeReplies?: boolean;
  excludeRetweets?: boolean;
  maxReplyCount?: number;
  minAuthorFollowers?: number;
  paginationToken?: string;
};

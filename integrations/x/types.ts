/** Referenced tweet (reply, retweet, quote) from X API. */
export type XReferencedTweet = {
  type: "replied_to" | "retweeted" | "quoted";
  id: string;
};

export type XTweet = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  conversation_id?: string;
  lang?: string;
  referenced_tweets?: XReferencedTweet[];
};

export type XUserPublicMetrics = {
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  listed_count?: number;
};

export type XTweetPublicMetrics = {
  retweet_count?: number;
  reply_count?: number;
  like_count?: number;
  quote_count?: number;
  impression_count?: number;
};

export type XTweetWithMetrics = XTweet & {
  public_metrics?: XTweetPublicMetrics;
  author_metrics?: XUserPublicMetrics;
  author_username?: string;
  author_name?: string;
  author_profile_image_url?: string;
};

/**
 * Request parameters for GET /2/users/:id/timelines/reverse_chronological
 * per docs/instructions.md (required params for reply decisions, AI context, conversation threading).
 */
export const TIMELINE_TWEET_FIELDS =
  "author_id,created_at,conversation_id,public_metrics,referenced_tweets,lang,text" as const;

export const TIMELINE_USER_FIELDS =
  "id,username,name,profile_image_url,public_metrics" as const;

export type HomeTimelineOptions = {
  maxResults?: number;
  startTime?: string; // ISO 8601 e.g. 2025-03-05T18:00:00Z
  endTime?: string;
  excludeReplies?: boolean;
  excludeRetweets?: boolean;
};

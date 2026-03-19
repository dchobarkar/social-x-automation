/**
 * X (Twitter) API types and timeline constants.
 * Used by integrations/x for API calls.
 */

/** Referenced tweet (reply, retweet, quote) from X API. */
export type XReferencedTweet = {
  type: "replied_to" | "retweeted" | "quoted";
  id: string;
};

export type XTweet = {
  id: string;
  text: string;
  note_tweet?: {
    text: string;
  };
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

/** Media attachment from X API (photo, video, animated_gif). */
export type XMedia = {
  media_key?: string;
  type: "photo" | "video" | "animated_gif";
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
  variants?: {
    bit_rate?: number;
    content_type?: string;
    url: string;
  }[];
};

export type XTweetWithMetrics = XTweet & {
  public_metrics?: XTweetPublicMetrics;
  author_metrics?: XUserPublicMetrics;
  author_verified?: boolean;
  author_username?: string;
  author_name?: string;
  author_profile_image_url?: string;
  media?: XMedia[];
};

// Request parameters for GET /2/users/:id/timelines/reverse_chronological.
export type HomeTimelineOptions = {
  maxResults?: number;
  startTime?: string; // ISO 8601 e.g. 2025-03-05T18:00:00Z
  endTime?: string;
  sinceId?: string;
  excludeReplies?: boolean;
  excludeRetweets?: boolean;
  paginationToken?: string;
};

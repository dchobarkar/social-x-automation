export type XTweet = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
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

export type HomeTimelineOptions = {
  maxResults?: number;
  startTime?: string; // ISO 8601 e.g. 2025-03-05T18:00:00Z
  endTime?: string;
  excludeReplies?: boolean;
  excludeRetweets?: boolean;
};


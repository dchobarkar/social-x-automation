export type TweetMetrics = {
  reply_count?: number;
  like_count?: number;
  retweet_count?: number;
  quote_count?: number;
};

export type TweetMedia = {
  type: "photo" | "video" | "animated_gif";
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
};

export type VariantChoice = "humorous" | "insightful";

export type StoredTweet = {
  id: string;
  text: string;
  humorous?: string;
  insightful?: string;
  selected: VariantChoice;
  author_username?: string;
  author_name?: string;
  author_profile_image_url?: string;
  created_at?: string;
  public_metrics?: TweetMetrics;
  author_followers_count?: number;
  media?: TweetMedia[];
};

export type FeedApiItem = {
  id: string;
  text: string;
  author_username?: string;
  author_name?: string;
  author_profile_image_url?: string;
  created_at?: string;
  public_metrics?: TweetMetrics;
  author_metrics?: { followers_count?: number };
  media?: TweetMedia[];
};

export type SearchWithRepliesItem = {
  tweet: { id: string; text: string };
  humorous: string;
  insightful: string;
};

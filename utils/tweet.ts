import type {
  StoredTweet,
  FeedApiItem,
  SearchWithRepliesItem,
  VariantChoice,
} from "@/types/tweet";

export const mapFeedApiItemsToStored = (raw: FeedApiItem[]): StoredTweet[] =>
  raw.map((item) => ({
    id: item.id,
    text: item.text,
    selected: "humorous",
    author_username: item.author_username,
    author_name: item.author_name,
    author_profile_image_url: item.author_profile_image_url,
    created_at: item.created_at,
    public_metrics: item.public_metrics,
    author_followers_count: item.author_metrics?.followers_count,
  }));

export const mapSearchWithRepliesToStored = (
  items: SearchWithRepliesItem[],
): StoredTweet[] =>
  items.map((item) => ({
    id: item.tweet.id,
    text: item.tweet.text,
    humorous: item.humorous,
    insightful: item.insightful,
    selected: "humorous" as VariantChoice,
  }));

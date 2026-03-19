import type { StoredTweet, FeedApiItem } from "@/types/x/tweet";

/**
 * Merge newly fetched stored items with existing workspace items.
 * New items are prepended; existing items not in the new set are kept (order: new first, then existing).
 * When an id exists in both, the existing record is kept to preserve reply variants and selection.
 */
export const mergeStoredTweetsWithExisting = (
  existing: StoredTweet[],
  newItems: StoredTweet[],
): StoredTweet[] => {
  const newIds = new Set(newItems.map((t) => t.id));
  const existingById = new Map(existing.map((t) => [t.id, t]));
  for (const t of newItems)
    if (!existingById.has(t.id)) existingById.set(t.id, t);

  const onlyExisting = existing.filter((t) => !newIds.has(t.id));
  const merged = [...newItems, ...onlyExisting];
  return merged;
};

export const mapFeedApiItemsToStored = (raw: FeedApiItem[]): StoredTweet[] =>
  raw.map((item) => ({
    id: item.id,
    text: item.text,
    selected: "insightful",
    author_username: item.author_username,
    author_name: item.author_name,
    author_profile_image_url: item.author_profile_image_url,
    created_at: item.created_at,
    public_metrics: item.public_metrics,
    author_followers_count: item.author_metrics?.followers_count,
    media: item.media,
  }));

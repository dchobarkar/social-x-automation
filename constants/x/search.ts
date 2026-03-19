export const X_SEARCH_DEFAULT_MAX_RESULTS = 10;

export const X_SEARCH_SORT_OPTIONS = [
  { value: "recency", label: "Recency" },
  { value: "relevancy", label: "Relevancy" },
] as const;

export const X_SEARCH_TWEET_FIELDS =
  "created_at,public_metrics,conversation_id,author_id,lang" as const;

export const X_SEARCH_USER_FIELDS =
  "id,name,username,public_metrics,profile_image_url,verified" as const;

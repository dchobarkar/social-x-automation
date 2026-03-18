// X timeline API field sets (for GET /2/users/:id/timelines/reverse_chronological query params).
export const TIMELINE_TWEET_FIELDS =
  "author_id,created_at,conversation_id,public_metrics,referenced_tweets,lang,text,attachments" as const;

export const TIMELINE_USER_FIELDS =
  "id,username,name,profile_image_url,public_metrics" as const;

export const TIMELINE_MEDIA_FIELDS =
  "media_key,url,preview_image_url,type,width,height,variants" as const;

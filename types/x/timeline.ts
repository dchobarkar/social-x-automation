import type {
  XMedia,
  XReferencedTweet,
  XTweetPublicMetrics,
  XUserPublicMetrics,
} from "@/types/x/api";

export type XHomeTimelineTweet = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  conversation_id?: string;
  lang?: string;
  referenced_tweets?: XReferencedTweet[];
  public_metrics?: XTweetPublicMetrics;
  attachments?: {
    media_keys?: string[];
  };
};

export type XHomeTimelineUser = {
  id: string;
  username?: string;
  name?: string;
  profile_image_url?: string;
  public_metrics?: XUserPublicMetrics;
};

export type XHomeTimelineMedia = {
  media_key: string;
  type: XMedia["type"];
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
};

export type XHomeTimelineResponse = {
  data?: XHomeTimelineTweet[];
  includes?: {
    users?: XHomeTimelineUser[];
    media?: XHomeTimelineMedia[];
  };
};

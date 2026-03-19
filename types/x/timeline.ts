import type {
  XMedia,
  XReferencedTweet,
  XTweetPublicMetrics,
  XUserPublicMetrics,
} from "@/types/x/api";

export type XHomeTimelineTweet = {
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
  verified?: boolean;
  public_metrics?: XUserPublicMetrics;
};

export type XHomeTimelineMedia = {
  media_key: string;
  type: XMedia["type"];
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
  variants?: XMedia["variants"];
};

export type XHomeTimelineResponse = {
  data?: XHomeTimelineTweet[];
  includes?: {
    tweets?: XHomeTimelineTweet[];
    users?: XHomeTimelineUser[];
    media?: XHomeTimelineMedia[];
  };
  meta?: {
    next_token?: string;
    previous_token?: string;
    result_count?: number;
  };
};

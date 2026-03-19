import type { TweetMedia } from "@/types/x/tweet";

export type XSearchSortOrder = "recency" | "relevancy";

export type SearchQueryBuilderParams = {
  keywords: string[];
  exactPhrases?: string[];
  excludeRetweets?: boolean;
  englishOnly?: boolean;
  verifiedOnly?: boolean;
  fromUsers?: string[];
  hashtags?: string[];
};

export type SearchPostsParams = {
  query: string;
  maxResults?: number;
  sinceId?: string;
  nextToken?: string;
  sortOrder?: XSearchSortOrder;
};

export type SearchPostsResult = {
  posts: NormalizedPost[];
  nextToken?: string;
};

export type XSearchFilters = SearchQueryBuilderParams & {
  maxResults?: number;
  sinceId?: string;
  nextToken?: string;
  sortOrder?: XSearchSortOrder;
};

export type NormalizedPost = {
  id: string;
  text: string;
  createdAt?: string;
  metrics: {
    likeCount: number;
    replyCount: number;
    retweetCount: number;
  };
  author: {
    id: string;
    username?: string;
    name?: string;
    profileImage?: string;
    followers?: number;
    verified?: boolean;
  };
  conversationId?: string;
  lang?: string;
  media?: TweetMedia[];
};

export type XRecentSearchTweet = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  conversation_id?: string;
  lang?: string;
  attachments?: {
    media_keys?: string[];
  };
  public_metrics?: {
    like_count?: number;
    reply_count?: number;
    retweet_count?: number;
  };
};

export type XRecentSearchUser = {
  id: string;
  username?: string;
  name?: string;
  profile_image_url?: string;
  verified?: boolean;
  public_metrics?: {
    followers_count?: number;
  };
};

export type XRecentSearchMedia = TweetMedia & {
  media_key: string;
};

export type XRecentSearchResponse = {
  data?: XRecentSearchTweet[];
  includes?: {
    users?: XRecentSearchUser[];
    media?: XRecentSearchMedia[];
  };
  meta?: {
    next_token?: string;
  };
};

export type XSearchSortOrder = "recency" | "relevancy";

export type SearchQueryBuilderParams = {
  keywords: string[];
  exactPhrases?: string[];
  excludeRetweets?: boolean;
  fromUsers?: string[];
  hashtags?: string[];
};

export type SearchPostsParams = {
  query: string;
  maxResults?: number;
  nextToken?: string;
  sortOrder?: XSearchSortOrder;
};

export type SearchPostsResult = {
  posts: NormalizedPost[];
  nextToken?: string;
};

export type XSearchFilters = SearchQueryBuilderParams & {
  maxResults?: number;
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
  };
  conversationId?: string;
  lang?: string;
};

export type XRecentSearchTweet = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
  conversation_id?: string;
  lang?: string;
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
  public_metrics?: {
    followers_count?: number;
  };
};

export type XRecentSearchResponse = {
  data?: XRecentSearchTweet[];
  includes?: {
    users?: XRecentSearchUser[];
  };
  meta?: {
    next_token?: string;
  };
};

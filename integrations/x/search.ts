import type {
  SearchPostsParams,
  SearchPostsResult,
  XRecentSearchResponse,
} from "@/types/x/search";
import { X_API_BASE } from "@/constants/x/api";
import {
  X_SEARCH_DEFAULT_MAX_RESULTS,
  X_SEARCH_TWEET_FIELDS,
  X_SEARCH_USER_FIELDS,
} from "@/constants/x/search";

export class XSearchServiceError extends Error {
  code: "auth" | "rate_limit" | "invalid_query" | "network" | "unknown";
  status?: number;

  constructor(
    message: string,
    code: XSearchServiceError["code"],
    status?: number,
  ) {
    super(message);
    this.name = "XSearchServiceError";
    this.code = code;
    this.status = status;
  }
}

const getBearerToken = (): string => {
  const token = process.env.X_BEARER_TOKEN;
  if (!token?.trim()) {
    throw new XSearchServiceError(
      "X_BEARER_TOKEN must be configured before search can run.",
      "auth",
      401,
    );
  }

  return token.trim();
};

const getErrorFromStatus = (
  status: number,
  details: string,
): XSearchServiceError => {
  if (status === 401) {
    return new XSearchServiceError(
      "X recent search authentication failed. Check X_BEARER_TOKEN.",
      "auth",
      status,
    );
  }

  if (status === 429) {
    return new XSearchServiceError(
      "X recent search rate limit exceeded. Please wait and try again.",
      "rate_limit",
      status,
    );
  }

  if (status === 400) {
    return new XSearchServiceError(
      `Invalid X search query. ${details}`.trim(),
      "invalid_query",
      status,
    );
  }

  return new XSearchServiceError(
    `X recent search failed with status ${status}. ${details}`.trim(),
    "unknown",
    status,
  );
};

export const searchRecentPosts = async ({
  query,
  maxResults = X_SEARCH_DEFAULT_MAX_RESULTS,
  nextToken,
  sortOrder = "recency",
}: SearchPostsParams): Promise<SearchPostsResult> => {
  const bearerToken = getBearerToken();
  const params = new URLSearchParams({
    query: query.trim(),
    max_results: String(Math.min(Math.max(maxResults, 10), 100)),
    "tweet.fields": X_SEARCH_TWEET_FIELDS,
    expansions: "author_id",
    "user.fields": X_SEARCH_USER_FIELDS,
    sort_order: sortOrder,
  });

  if (nextToken?.trim()) params.set("next_token", nextToken.trim());

  const url = `${X_API_BASE}/tweets/search/recent?${params.toString()}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    throw new XSearchServiceError(
      error instanceof Error
        ? `Network error while searching X: ${error.message}`
        : "Network error while searching X.",
      "network",
    );
  }

  if (!response.ok) {
    const details = await response.text();
    throw getErrorFromStatus(response.status, details);
  }

  const json = (await response.json()) as XRecentSearchResponse;
  const usersById = new Map(
    (json.includes?.users ?? []).map((user) => [user.id, user]),
  );

  return {
    posts: (json.data ?? []).map((tweet) => {
      const author = tweet.author_id
        ? usersById.get(tweet.author_id)
        : undefined;

      return {
        id: tweet.id,
        text: tweet.text,
        createdAt: tweet.created_at,
        conversationId: tweet.conversation_id,
        lang: tweet.lang,
        metrics: {
          likeCount: tweet.public_metrics?.like_count ?? 0,
          replyCount: tweet.public_metrics?.reply_count ?? 0,
          retweetCount: tweet.public_metrics?.retweet_count ?? 0,
        },
        author: {
          id: author?.id ?? tweet.author_id ?? "",
          username: author?.username,
          name: author?.name,
          profileImage: author?.profile_image_url,
          followers: author?.public_metrics?.followers_count,
          verified: author?.verified,
        },
      };
    }),
    nextToken: json.meta?.next_token,
  };
};

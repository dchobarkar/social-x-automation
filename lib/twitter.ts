import { TwitterApi } from "twitter-api-v2";

import { getTokens, updateTokens } from "./tokenStore";

const X_API_BASE = "https://api.x.com/2";

export type XTweet = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
};

export type XUserPublicMetrics = {
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  listed_count?: number;
};

export type XTweetPublicMetrics = {
  retweet_count?: number;
  reply_count?: number;
  like_count?: number;
  quote_count?: number;
  impression_count?: number;
};

export type XTweetWithMetrics = XTweet & {
  public_metrics?: XTweetPublicMetrics;
  author_metrics?: XUserPublicMetrics;
  author_username?: string;
  author_name?: string;
  author_profile_image_url?: string;
};

export type HomeTimelineOptions = {
  maxResults?: number;
  startTime?: string; // ISO 8601 e.g. 2025-03-05T18:00:00Z
  endTime?: string;
  excludeReplies?: boolean;
  excludeRetweets?: boolean;
};

const getValidAccessToken = async (): Promise<string> => {
  const tokens = await getTokens();
  if (!tokens) throw new Error("Not authenticated. Connect X account first.");

  const now = Date.now();
  const bufferMs = 60 * 1000; // refresh 1 min before expiry
  if (tokens.expires_at > now + bufferMs) return tokens.access_token;

  await refreshTokens();
  const updated = await getTokens();

  if (!updated) throw new Error("Token refresh failed");
  return updated.access_token;
};

const refreshTokens = async (): Promise<void> => {
  const tokens = await getTokens();
  if (!tokens?.refresh_token) throw new Error("No refresh token available");

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    throw new Error("X_CLIENT_ID and X_CLIENT_SECRET must be set");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
    client_id: clientId,
  });
  const res = await fetch(`${X_API_BASE.replace("/2", "")}/2/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  await updateTokens({
    access_token: data.access_token,
    ...(data.refresh_token && { refresh_token: data.refresh_token }),
    expires_in: data.expires_in,
  });
};

const getTwitterClient = async (): Promise<TwitterApi> => {
  const accessToken = await getValidAccessToken();
  // twitter-api-v2 accepts a bearer token string for OAuth2 user/app context.
  return new TwitterApi(accessToken);
};

export const searchTweetsByKeyword = async (
  query: string,
  maxResults = 5,
): Promise<XTweet[]> => {
  const trimmed = query.trim();
  if (!trimmed) throw new Error("Search query must not be empty");

  const limit = Math.min(Math.max(maxResults, 1), 20);
  const client = await getTwitterClient();

  // The twitter-api-v2 client uses the v2 search recent endpoint under the hood.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await client.v2.search(trimmed, {
    "tweet.fields": ["author_id", "created_at"],
    max_results: limit,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tweets: XTweet[] = (result.tweets ?? []).map((t: any) => ({
    id: t.id,
    text: t.text,
    author_id: t.author_id,
    created_at: t.created_at,
  }));
  return tweets;
};

/**
 * Post a reply to a tweet. On 401, refreshes the token and retries once.
 */
export const postReply = async (
  text: string,
  tweetId: string,
): Promise<{ data: { id: string } }> => {
  const accessToken = await getValidAccessToken();
  const doPost = async (token: string) => {
    const res = await fetch(`${X_API_BASE}/tweets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        reply: { in_reply_to_tweet_id: tweetId },
      }),
    });
    return { res, ok: res.ok, status: res.status };
  };

  let result = await doPost(accessToken);
  if (result.status === 401) {
    await refreshTokens();
    const newTokens = await getTokens();

    if (!newTokens) throw new Error("Refresh failed");
    result = await doPost(newTokens.access_token);
  }

  if (!result.ok) {
    const err = await result.res.text();
    throw new Error(`X API error: ${result.status} ${err}`);
  }
  return result.res.json() as Promise<{ data: { id: string } }>;
};

/** Get the authenticated user's id and profile (for timeline). */
export const getMe = async (): Promise<{
  id: string;
  username: string;
  name: string;
}> => {
  const accessToken = await getValidAccessToken();
  let res = await fetch(`${X_API_BASE}/users/me?user.fields=public_metrics`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) {
    await refreshTokens();
    const updated = await getTokens();
    if (updated) {
      res = await fetch(`${X_API_BASE}/users/me?user.fields=public_metrics`, {
        headers: { Authorization: `Bearer ${updated.access_token}` },
      });
    }
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`X API users/me error: ${res.status} ${err}`);
  }

  const json = (await res.json()) as {
    data?: { id: string; username: string; name: string };
  };
  if (!json.data?.id) throw new Error("X API users/me returned no user");
  return json.data;
};

/**
 * Get the authenticated user's home timeline (same as X home feed).
 * Uses GET /2/users/:id/timelines/reverse_chronological.
 * Optional server-side filters: time range, exclude replies/retweets.
 * Returns tweets with public_metrics and author public_metrics so you can filter
 * client-side by reply_count, author followers, etc.
 */
export const getHomeTimeline = async (
  userId: string,
  options: HomeTimelineOptions = {},
): Promise<XTweetWithMetrics[]> => {
  const accessToken = await getValidAccessToken();
  const maxResults = Math.min(Math.max(options.maxResults ?? 20, 1), 100);
  const params = new URLSearchParams({
    "tweet.fields": "public_metrics,created_at,author_id,text",
    expansions: "author_id",
    "user.fields": "public_metrics,username,name,profile_image_url",
    max_results: String(maxResults),
  });
  if (options.startTime) params.set("start_time", options.startTime);
  if (options.endTime) params.set("end_time", options.endTime);
  const exclude: string[] = [];
  if (options.excludeReplies) exclude.push("replies");
  if (options.excludeRetweets) exclude.push("retweets");
  if (exclude.length) params.set("exclude", exclude.join(","));

  const url = `${X_API_BASE}/users/${encodeURIComponent(userId)}/timelines/reverse_chronological?${params.toString()}`;
  let res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) {
    await refreshTokens();
    const updated = await getTokens();
    if (updated) {
      res = await fetch(url, {
        headers: { Authorization: `Bearer ${updated.access_token}` },
      });
    }
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`X API timeline error: ${res.status} ${err}`);
  }
  const json = (await res.json()) as {
    data?: Array<{
      id: string;
      text: string;
      author_id?: string;
      created_at?: string;
      public_metrics?: XTweetPublicMetrics;
    }>;
    includes?: {
      users?: Array<{
        id: string;
        username?: string;
        name?: string;
        profile_image_url?: string;
        public_metrics?: XUserPublicMetrics;
      }>;
    };
  };
  const tweets = json.data ?? [];
  const usersById = new Map((json.includes?.users ?? []).map((u) => [u.id, u]));
  const result: XTweetWithMetrics[] = tweets.map((t) => {
    const author = t.author_id ? usersById.get(t.author_id) : undefined;
    return {
      id: t.id,
      text: t.text,
      author_id: t.author_id,
      created_at: t.created_at,
      public_metrics: t.public_metrics,
      author_metrics: author?.public_metrics,
      author_username: author?.username,
      author_name: author?.name,
      author_profile_image_url: author?.profile_image_url,
    };
  });
  return result;
};

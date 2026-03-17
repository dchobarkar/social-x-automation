import { TwitterApi } from "twitter-api-v2";

import type { XTweet } from "@/types/x/api";
import { getValidAccessToken } from "./auth";

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

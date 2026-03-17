import { getTokens } from "@/lib/tokenStore";

import { getValidAccessToken, refreshTokens } from "./auth";
import type {
  HomeTimelineOptions,
  XReferencedTweet,
  XTweetPublicMetrics,
  XTweetWithMetrics,
  XUserPublicMetrics,
} from "./types";
import type { XMedia } from "./types";
import {
  TIMELINE_TWEET_FIELDS,
  TIMELINE_USER_FIELDS,
  TIMELINE_MEDIA_FIELDS,
} from "./types";

const X_API_BASE = "https://api.x.com/2";

/**
 * Get the authenticated user's home timeline (same as X home feed).
 * Uses GET /2/users/:id/timelines/reverse_chronological.
 * Request params follow docs/instructions.md (tweet.fields, user.fields, exclude)
 * for reply decisions, AI context, and conversation threading.
 * Optional server-side filters: time range, exclude replies/retweets.
 */
export const getHomeTimeline = async (
  userId: string,
  options: HomeTimelineOptions = {},
): Promise<XTweetWithMetrics[]> => {
  const accessToken = await getValidAccessToken();
  const maxResults = Math.min(Math.max(options.maxResults ?? 20, 1), 100);
  const params = new URLSearchParams({
    "tweet.fields": TIMELINE_TWEET_FIELDS,
    expansions: "author_id,attachments.media_keys",
    "user.fields": TIMELINE_USER_FIELDS,
    "media.fields": TIMELINE_MEDIA_FIELDS,
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
      conversation_id?: string;
      lang?: string;
      referenced_tweets?: XReferencedTweet[];
      public_metrics?: XTweetPublicMetrics;
      attachments?: { media_keys?: string[] };
    }>;
    includes?: {
      users?: Array<{
        id: string;
        username?: string;
        name?: string;
        profile_image_url?: string;
        public_metrics?: XUserPublicMetrics;
      }>;
      media?: Array<{
        media_key: string;
        type: string;
        url?: string;
        preview_image_url?: string;
        width?: number;
        height?: number;
      }>;
    };
  };
  const tweets = json.data ?? [];
  const usersById = new Map((json.includes?.users ?? []).map((u) => [u.id, u]));
  const mediaByKey = new Map(
    (json.includes?.media ?? []).map((m) => [
      m.media_key,
      {
        type: m.type as XMedia["type"],
        url: m.url,
        preview_image_url: m.preview_image_url,
        width: m.width,
        height: m.height,
      } satisfies XMedia,
    ]),
  );
  const result: XTweetWithMetrics[] = tweets.map((t) => {
    const author = t.author_id ? usersById.get(t.author_id) : undefined;
    const media =
      t.attachments?.media_keys?.map((k) => mediaByKey.get(k)).filter(Boolean) as
        | XMedia[]
        | undefined;
    return {
      id: t.id,
      text: t.text,
      author_id: t.author_id,
      created_at: t.created_at,
      conversation_id: t.conversation_id,
      lang: t.lang,
      referenced_tweets: t.referenced_tweets,
      public_metrics: t.public_metrics,
      author_metrics: author?.public_metrics,
      author_username: author?.username,
      author_name: author?.name,
      author_profile_image_url: author?.profile_image_url,
      media: media?.length ? media : undefined,
    };
  });
  return result;
};

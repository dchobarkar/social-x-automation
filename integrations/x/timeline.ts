import type { HomeTimelineOptions, XTweetWithMetrics } from "@/types/x/api";
import type { XMedia } from "@/types/x/api";
import type { XHomeTimelineResponse } from "@/types/x/timeline";
import { getTokens } from "@/lib/storage/tokenStore";
import {
  TIMELINE_TWEET_FIELDS,
  TIMELINE_USER_FIELDS,
  TIMELINE_MEDIA_FIELDS,
} from "@/constants/x/timeline";
import { X_API_BASE } from "@/constants/x/api";
import { getValidAccessToken, refreshTokens } from "./auth";

const getTweetText = (tweet: {
  text: string;
  note_tweet?: { text: string };
}): string => tweet.note_tweet?.text ?? tweet.text;

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
): Promise<{ posts: XTweetWithMetrics[]; nextToken?: string }> => {
  const accessToken = await getValidAccessToken();
  const maxResults = Math.min(Math.max(options.maxResults ?? 20, 1), 100);
  const params = new URLSearchParams({
    "tweet.fields": TIMELINE_TWEET_FIELDS,
    expansions:
      "author_id,attachments.media_keys,referenced_tweets.id,referenced_tweets.id.author_id",
    "user.fields": TIMELINE_USER_FIELDS,
    "media.fields": TIMELINE_MEDIA_FIELDS,
    max_results: String(maxResults),
  });

  if (options.startTime) params.set("start_time", options.startTime);
  if (options.endTime) params.set("end_time", options.endTime);
  if (options.sinceId) params.set("since_id", options.sinceId);
  if (options.paginationToken) {
    params.set("pagination_token", options.paginationToken);
  }
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
  const json = (await res.json()) as XHomeTimelineResponse;
  const tweets = json.data ?? [];
  const usersById = new Map((json.includes?.users ?? []).map((u) => [u.id, u]));
  const tweetsById = new Map(
    (json.includes?.tweets ?? []).map((t) => [t.id, t]),
  );
  const mediaByKey = new Map(
    (json.includes?.media ?? []).map((m) => [
      m.media_key,
      {
        media_key: m.media_key,
        type: m.type,
        url: m.url,
        preview_image_url: m.preview_image_url,
        width: m.width,
        height: m.height,
        variants: m.variants,
      } satisfies XMedia,
    ]),
  );
  const posts: XTweetWithMetrics[] = tweets.map((t) => {
    const author = t.author_id ? usersById.get(t.author_id) : undefined;
    const retweetedTweetId = t.referenced_tweets?.find(
      (ref) => ref.type === "retweeted",
    )?.id;
    const retweetedTweet = retweetedTweetId
      ? tweetsById.get(retweetedTweetId)
      : undefined;
    const retweetedAuthor = retweetedTweet?.author_id
      ? usersById.get(retweetedTweet.author_id)
      : undefined;
    const media = t.attachments?.media_keys
      ?.map((k) => mediaByKey.get(k))
      .filter(Boolean) as XMedia[] | undefined;
    const text = retweetedTweet
      ? `RT ${retweetedAuthor?.username ? `@${retweetedAuthor.username}: ` : ""}${getTweetText(retweetedTweet)}`
      : getTweetText(t);

    return {
      id: t.id,
      text,
      note_tweet: t.note_tweet,
      author_id: t.author_id,
      created_at: t.created_at,
      conversation_id: t.conversation_id,
      lang: t.lang,
      referenced_tweets: t.referenced_tweets,
      public_metrics: t.public_metrics,
      author_metrics: author?.public_metrics,
      author_verified: author?.verified,
      author_username: author?.username,
      author_name: author?.name,
      author_profile_image_url: author?.profile_image_url,
      media: media?.length ? media : undefined,
    };
  });
  return {
    posts,
    nextToken: json.meta?.next_token,
  };
};

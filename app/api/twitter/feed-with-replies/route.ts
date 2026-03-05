import { NextRequest, NextResponse } from "next/server";

import { generateReplyVariants } from "@/lib/openai";
import {
  getMe,
  getHomeTimeline,
  type HomeTimelineOptions,
} from "@/lib/twitter";

type FeedFilters = {
  maxResults?: number;
  startTime?: string;
  endTime?: string;
  excludeReplies?: boolean;
  excludeRetweets?: boolean;
  maxReplyCount?: number;
  minAuthorFollowers?: number;
  lastHours?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const filters: FeedFilters = {
      maxResults:
        typeof body.maxResults === "number"
          ? Math.min(Math.max(body.maxResults, 1), 100)
          : 20,
      startTime:
        typeof body.startTime === "string" ? body.startTime : undefined,
      endTime: typeof body.endTime === "string" ? body.endTime : undefined,
      excludeReplies: Boolean(body.excludeReplies),
      excludeRetweets: Boolean(body.excludeRetweets),
      maxReplyCount:
        typeof body.maxReplyCount === "number" ? body.maxReplyCount : undefined,
      minAuthorFollowers:
        typeof body.minAuthorFollowers === "number"
          ? body.minAuthorFollowers
          : undefined,
      lastHours:
        typeof body.lastHours === "number" ? body.lastHours : undefined,
    };
    if (filters.lastHours != null && filters.lastHours > 0) {
      const d = new Date();
      d.setHours(d.getHours() - filters.lastHours);
      filters.startTime = d.toISOString();
    }

    const me = await getMe();
    const opts: HomeTimelineOptions = {
      maxResults: filters.maxResults ?? 20,
      startTime: filters.startTime,
      endTime: filters.endTime,
      excludeReplies: filters.excludeReplies,
      excludeRetweets: filters.excludeRetweets,
    };
    let tweets = await getHomeTimeline(me.id, opts);
    if (typeof filters.maxReplyCount === "number") {
      tweets = tweets.filter(
        (t) => (t.public_metrics?.reply_count ?? 0) <= filters.maxReplyCount!,
      );
    }
    if (typeof filters.minAuthorFollowers === "number") {
      tweets = tweets.filter(
        (t) =>
          (t.author_metrics?.followers_count ?? 0) >=
          filters.minAuthorFollowers!,
      );
    }

    const items = [];
    for (const tweet of tweets) {
      const variants = await generateReplyVariants(tweet.text);
      items.push({
        tweet: {
          id: tweet.id,
          text: tweet.text,
          author_id: tweet.author_id,
          created_at: tweet.created_at,
          public_metrics: tweet.public_metrics,
          author_metrics: tweet.author_metrics,
          author_username: tweet.author_username,
          author_name: tweet.author_name,
        },
        humorous: variants.humorous,
        insightful: variants.insightful,
      });
    }

    return NextResponse.json({ items });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load feed and generate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

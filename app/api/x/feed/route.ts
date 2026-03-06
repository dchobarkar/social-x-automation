import { NextRequest, NextResponse } from "next/server";

import { getMe, getHomeTimeline, type XTweetWithMetrics } from "@/lib/twitter";

export type FeedFilters = {
  maxResults?: number;
  startTime?: string;
  endTime?: string;
  excludeReplies?: boolean;
  excludeRetweets?: boolean;
  maxReplyCount?: number;
  minAuthorFollowers?: number;
};

const getFeed = async (filters: FeedFilters): Promise<XTweetWithMetrics[]> => {
  const me = await getMe();
  const tweets = await getHomeTimeline(me.id, {
    maxResults: filters.maxResults ?? 20,
    startTime: filters.startTime,
    endTime: filters.endTime,
    excludeReplies: filters.excludeReplies,
    excludeRetweets: filters.excludeRetweets,
  });

  let result = tweets;
  if (typeof filters.maxReplyCount === "number") {
    result = result.filter(
      (t) => (t.public_metrics?.reply_count ?? 0) <= filters.maxReplyCount!,
    );
  }
  if (typeof filters.minAuthorFollowers === "number") {
    result = result.filter(
      (t) =>
        (t.author_metrics?.followers_count ?? 0) >= filters.minAuthorFollowers!,
    );
  }
  return result;
};

export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const lastHours = searchParams.get("lastHours");
    let startTime: string | undefined;
    if (lastHours != null && lastHours !== "") {
      const h = Number.parseFloat(lastHours);
      if (Number.isFinite(h) && h > 0) {
        const d = new Date();
        d.setHours(d.getHours() - h);
        startTime = d.toISOString();
      }
    }
    const filters: FeedFilters = {
      maxResults: Math.min(
        Math.max(
          Number.parseInt(searchParams.get("maxResults") ?? "20", 10) || 20,
          1,
        ),
        100,
      ),
      startTime: startTime ?? searchParams.get("startTime") ?? undefined,
      endTime: searchParams.get("endTime") ?? undefined,
      excludeReplies:
        searchParams.get("excludeReplies") === "1" ||
        searchParams.get("excludeReplies") === "true",
      excludeRetweets:
        searchParams.get("excludeRetweets") === "1" ||
        searchParams.get("excludeRetweets") === "true",
      maxReplyCount:
        searchParams.get("maxReplyCount") != null
          ? Number.parseInt(searchParams.get("maxReplyCount")!, 10)
          : undefined,
      minAuthorFollowers:
        searchParams.get("minAuthorFollowers") != null
          ? Number.parseInt(searchParams.get("minAuthorFollowers")!, 10)
          : undefined,
    };
    if (Number.isNaN(filters.maxReplyCount as number))
      filters.maxReplyCount = undefined;
    if (Number.isNaN(filters.minAuthorFollowers as number))
      filters.minAuthorFollowers = undefined;

    const items = await getFeed(filters);
    return NextResponse.json({ items });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load home feed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const POST = async (request: NextRequest) => {
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
    };
    if (body.lastHours != null) {
      const h = Number(body.lastHours);
      if (Number.isFinite(h) && h > 0) {
        const d = new Date();
        d.setHours(d.getHours() - h);
        filters.startTime = d.toISOString();
      }
    }
    const items = await getFeed(filters);
    return NextResponse.json({ items });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load home feed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

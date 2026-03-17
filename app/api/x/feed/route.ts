import { NextRequest, NextResponse } from "next/server";

import type { FeedFilters } from "@/types/x/feed";
import { getHomeFeed } from "@/services/x/feed.service";

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
      excludeReplies: searchParams.has("excludeReplies")
        ? searchParams.get("excludeReplies") === "1" ||
          searchParams.get("excludeReplies") === "true"
        : undefined,
      excludeRetweets: searchParams.has("excludeRetweets")
        ? searchParams.get("excludeRetweets") === "1" ||
          searchParams.get("excludeRetweets") === "true"
        : undefined,
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

    const items = await getHomeFeed(filters);
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
      excludeReplies:
        body.excludeReplies !== undefined
          ? Boolean(body.excludeReplies)
          : undefined,
      excludeRetweets:
        body.excludeRetweets !== undefined
          ? Boolean(body.excludeRetweets)
          : undefined,
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
    const items = await getHomeFeed(filters);
    return NextResponse.json({ items });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load home feed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

import { NextRequest, NextResponse } from "next/server";

import { searchTweetsWithReplyVariants } from "@/services/x/searchService";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    const query = body?.query;
    const maxResults = body?.maxResults;

    if (typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "query is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const limit =
      typeof maxResults === "number" && Number.isFinite(maxResults)
        ? maxResults
        : 5;

    const items = await searchTweetsWithReplyVariants(query, limit);

    return NextResponse.json({ items });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Search and generate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

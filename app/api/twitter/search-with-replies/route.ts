import { NextRequest, NextResponse } from "next/server";

import { generateReplyVariants } from "@/lib/openai";
import { searchTweetsByKeyword } from "@/lib/twitter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    const tweets = await searchTweetsByKeyword(query, limit);

    const items = [];
    for (const tweet of tweets) {
      const variants = await generateReplyVariants(tweet.text);
      items.push({
        tweet,
        humorous: variants.humorous,
        insightful: variants.insightful,
      });
    }

    return NextResponse.json({ items });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Search and generate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

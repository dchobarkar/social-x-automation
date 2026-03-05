import { NextRequest, NextResponse } from "next/server";

import { generateReplyVariants } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tweetText = body?.tweetText;

    if (typeof tweetText !== "string" || !tweetText.trim()) {
      return NextResponse.json(
        { error: "tweetText is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not set in .env.local" },
        { status: 500 },
      );
    }

    const variants = await generateReplyVariants(tweetText.trim());
    return NextResponse.json({
      humorous: variants.humorous,
      insightful: variants.insightful,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generate variants failed";
    console.error("[generate-variants]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

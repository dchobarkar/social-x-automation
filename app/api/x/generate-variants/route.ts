import { NextRequest, NextResponse } from "next/server";

import { generateXReplyVariants } from "@/services/x/variants.service";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    const tweetText = body?.tweetText;

    if (typeof tweetText !== "string" || !tweetText.trim()) {
      return NextResponse.json(
        { error: "tweetText is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const variants = await generateXReplyVariants(tweetText.trim());
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
};

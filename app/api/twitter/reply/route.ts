import { NextRequest, NextResponse } from "next/server";

import { postReply } from "@/lib/twitter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tweetId = body?.tweetId;
    const text = body?.text;

    if (typeof tweetId !== "string" || !tweetId.trim()) {
      return NextResponse.json(
        { error: "tweetId is required and must be a non-empty string" },
        { status: 400 },
      );
    }
    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "text is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const result = await postReply(text.trim(), tweetId.trim());
    return NextResponse.json({
      success: true,
      tweetId: result.data?.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Post reply failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

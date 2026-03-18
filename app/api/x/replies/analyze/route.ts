import { NextRequest, NextResponse } from "next/server";

import { analyzeXPost } from "@/services/x/replies.service";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    const post = body?.post;

    if (typeof post !== "string" || !post.trim()) {
      return NextResponse.json(
        { error: "post is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const analysis = await analyzeXPost({ post: post.trim() });

    return NextResponse.json({ analysis });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analyze post failed";
    console.error("[x/replies/analyze]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

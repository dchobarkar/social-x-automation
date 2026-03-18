import { NextRequest, NextResponse } from "next/server";

import { generateXReplyForPost } from "@/services/x/replies.service";
import type { ReplyTone } from "@/services/ai/replies/types";

const ALLOWED_TONES: ReplyTone[] = [
  "helpful",
  "insightful",
  "witty",
  "empathetic",
  "professional",
];

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    const post = body?.post;
    const tone = body?.tone;

    if (typeof post !== "string" || !post.trim()) {
      return NextResponse.json(
        { error: "post is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const reply = await generateXReplyForPost({
      post: post.trim(),
      tone:
        typeof tone === "string" && ALLOWED_TONES.includes(tone as ReplyTone)
          ? (tone as ReplyTone)
          : undefined,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generate reply failed";
    console.error("[x/replies/generate]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

import { NextRequest, NextResponse } from "next/server";

import { generateXReplyForPostWithValidation } from "@/services/x/replies.service";
import type { ReplyTone } from "@/types/ai/replies";

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

    const {
      reply,
      validation,
      tone: usedTone,
    } = await generateXReplyForPostWithValidation({
      post: post.trim(),
      tone:
        typeof tone === "string" && ALLOWED_TONES.includes(tone as ReplyTone)
          ? (tone as ReplyTone)
          : undefined,
    });

    if (!validation.isSafe) {
      return NextResponse.json(
        { reply, validation, error: "Reply failed validation", tone: usedTone },
        { status: 422 },
      );
    }

    return NextResponse.json({ reply, validation, tone: usedTone });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generate reply failed";
    console.error("[x/replies/generate]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

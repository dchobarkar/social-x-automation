import { NextRequest, NextResponse } from "next/server";

import { generateReply } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tweetText = body?.tweetText;

    if (typeof tweetText !== "string" || !tweetText.trim()) {
      return NextResponse.json(
        { error: "tweetText is required and must be a non-empty string" },
        { status: 400 },
      );
    }

    const reply = await generateReply(tweetText.trim());
    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generate failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

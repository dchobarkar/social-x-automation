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

    // Backward-compatible mapping to the legacy response shape.
    // "humorous" roughly maps to "witty".
    const humorous =
      variants.witty ??
      variants.helpful ??
      variants.insightful ??
      variants.empathetic ??
      variants.professional ??
      "";

    const insightful =
      variants.insightful ??
      variants.professional ??
      variants.helpful ??
      variants.empathetic ??
      variants.witty ??
      "";

    return NextResponse.json({
      humorous,
      insightful,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Generate variants failed";
    console.error("[generate-variants]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

import { NextResponse } from "next/server";

export const POST = () =>
  NextResponse.json(
    {
      error:
        "Direct posting from the app is disabled. Use Open in X to post manually.",
    },
    { status: 410 },
  );

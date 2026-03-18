import { NextResponse } from "next/server";

export const POST = () =>
  NextResponse.json(
    {
      error:
        "X keyword search is currently unavailable while the feature is being redesigned.",
    },
    { status: 410 },
  );

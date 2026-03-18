import { NextResponse } from "next/server";

const disabledResponse = () =>
  NextResponse.json(
    { error: "Saved X search is unavailable while search is being redesigned." },
    { status: 410 },
  );

export const GET = disabledResponse;
export const POST = disabledResponse;

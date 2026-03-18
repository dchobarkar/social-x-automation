import { NextResponse } from "next/server";

const disabledResponse = () =>
  NextResponse.json(
    { error: "This endpoint has been removed. Use the X feed draft workflow instead." },
    { status: 410 },
  );

export const GET = disabledResponse;
export const POST = disabledResponse;

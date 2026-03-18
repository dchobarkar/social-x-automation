import { NextResponse } from "next/server";

import { getXConnectedStatus } from "@/services/x/auth.service";

/**
 * Returns whether the app has stored X credentials (user has connected).
 * Does not expose tokens; only connected state and when access expires.
 */
export async function GET() {
  const status = await getXConnectedStatus();
  return NextResponse.json(status);
}

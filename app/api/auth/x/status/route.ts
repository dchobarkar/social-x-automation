import { NextResponse } from "next/server";

import { getTokens } from "@/lib/tokenStore";

/**
 * Returns whether the app has stored X credentials (user has connected).
 * Does not expose tokens; only connected state and when access expires.
 */
export async function GET() {
  const tokens = await getTokens();
  if (!tokens?.access_token) {
    return NextResponse.json({ connected: false });
  }
  return NextResponse.json({
    connected: true,
    accessExpiresAt: tokens.expires_at,
  });
}

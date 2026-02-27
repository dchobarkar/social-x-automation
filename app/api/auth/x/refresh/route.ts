import { NextResponse } from "next/server";

import { getTokens, updateTokens } from "@/lib/tokenStore";

const TOKEN_URL = "https://api.x.com/2/oauth2/token";

export async function POST() {
  const tokens = await getTokens();
  if (!tokens?.refresh_token) {
    return NextResponse.json(
      { error: "No refresh token available" },
      { status: 401 },
    );
  }

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Missing X client configuration" },
      { status: 500 },
    );
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
    client_id: clientId,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json(
      { error: `Refresh failed: ${err}` },
      { status: res.status },
    );
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  await updateTokens({
    access_token: data.access_token,
    ...(data.refresh_token && { refresh_token: data.refresh_token }),
    expires_in: data.expires_in,
  });

  return NextResponse.json({ ok: true });
}

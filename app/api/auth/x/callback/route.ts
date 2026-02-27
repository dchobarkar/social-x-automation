import { NextRequest, NextResponse } from "next/server";

import { consumePkceState } from "@/lib/pkceStateStore";
import { saveTokens } from "@/lib/tokenStore";

const TOKEN_URL = "https://api.x.com/2/oauth2/token";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const redirectUri =
    process.env.X_REDIRECT_URI ?? `${baseUrl}/api/auth/x/callback`;
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;

  if (error) {
    const dashboardUrl = `${baseUrl}/dashboard?error=${encodeURIComponent(error)}`;
    return NextResponse.redirect(dashboardUrl);
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=${encodeURIComponent("Missing code or state")}`,
    );
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=${encodeURIComponent("Server misconfiguration")}`,
    );
  }

  const code_verifier = await consumePkceState(state);
  if (!code_verifier) {
    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=${encodeURIComponent("Invalid or expired state")}`,
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier,
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
    return NextResponse.redirect(
      `${baseUrl}/dashboard?error=${encodeURIComponent(`Token exchange failed: ${err}`)}`,
    );
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  await saveTokens(
    data.access_token,
    data.refresh_token ?? "",
    data.expires_in,
  );

  return NextResponse.redirect(`${baseUrl}/dashboard?success=1`);
}

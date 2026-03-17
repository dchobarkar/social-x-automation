import { NextRequest, NextResponse } from "next/server";

import { exchangeXAuthorizationCodeForTokens } from "@/integrations/x/oauth";
import { consumePkceState } from "@/lib/storage/pkceStateStore";
import { saveTokens } from "@/lib/storage/tokenStore";

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

  const dashboardX = `${baseUrl}/dashboard/x`;

  if (error) {
    return NextResponse.redirect(
      `${dashboardX}?error=${encodeURIComponent(error)}`,
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${dashboardX}?error=${encodeURIComponent("Missing code or state")}`,
    );
  }

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${dashboardX}?error=${encodeURIComponent("Server misconfiguration")}`,
    );
  }

  const code_verifier = await consumePkceState(state);
  if (!code_verifier) {
    return NextResponse.redirect(
      `${dashboardX}?error=${encodeURIComponent("Invalid or expired state")}`,
    );
  }

  let data: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  try {
    data = await exchangeXAuthorizationCodeForTokens({
      code,
      codeVerifier: code_verifier,
      redirectUri,
      clientId,
      clientSecret,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Token exchange failed";
    return NextResponse.redirect(
      `${dashboardX}?error=${encodeURIComponent(message)}`,
    );
  }

  await saveTokens(
    data.access_token,
    data.refresh_token ?? "",
    data.expires_in,
  );

  return NextResponse.redirect(`${dashboardX}?success=1`);
}

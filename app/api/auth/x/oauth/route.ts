import { NextResponse } from "next/server";

import { savePkceState } from "@/lib/pkceStateStore";
import { X_AUTH_URL, X_OAUTH_SCOPES } from "@/constants/x/api";
import {
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
} from "@/lib/pkce";

export async function GET() {
  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = process.env.X_REDIRECT_URI;
  const baseUrl = process.env.APP_BASE_URL;

  if (!clientId || !redirectUri || !baseUrl) {
    return NextResponse.json(
      { error: "Missing X_CLIENT_ID, X_REDIRECT_URI, or APP_BASE_URL" },
      { status: 500 },
    );
  }

  const state = generateState();
  const code_verifier = generateCodeVerifier();
  const code_challenge = generateCodeChallenge(code_verifier);

  await savePkceState(state, code_verifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: X_OAUTH_SCOPES,
    state,
    code_challenge,
    code_challenge_method: "S256",
  });

  const url = `${X_AUTH_URL}?${params.toString()}`;
  return NextResponse.redirect(url);
}

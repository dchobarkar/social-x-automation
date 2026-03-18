import { NextResponse } from "next/server";

import { savePkceState } from "@/lib/storage/pkceStateStore";
import { buildXAuthorizeUrl } from "@/integrations/x/oauth";
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

  const url = buildXAuthorizeUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge: code_challenge,
  });
  return NextResponse.redirect(url);
}

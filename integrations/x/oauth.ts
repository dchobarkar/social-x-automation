import {
  X_AUTH_URL,
  X_OAUTH_SCOPES,
  X_OAUTH_TOKEN_URL,
} from "@/constants/x/api";

export const buildXAuthorizeUrl = (args: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
}): string => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: args.clientId,
    redirect_uri: args.redirectUri,
    scope: X_OAUTH_SCOPES,
    state: args.state,
    code_challenge: args.codeChallenge,
    code_challenge_method: "S256",
  });

  return `${X_AUTH_URL}?${params.toString()}`;
};

export const exchangeXAuthorizationCodeForTokens = async (args: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
  clientId: string;
  clientSecret: string;
}): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> => {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: args.code,
    redirect_uri: args.redirectUri,
    client_id: args.clientId,
    code_verifier: args.codeVerifier,
  });

  const res = await fetch(X_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${args.clientId}:${args.clientSecret}`).toString("base64")}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${err}`);
  }

  return (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
};

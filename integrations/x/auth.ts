import { getTokens, updateTokens } from "@/lib/storage/tokenStore";

import { X_OAUTH_TOKEN_URL } from "@/constants/x/api";

export const refreshTokens = async (): Promise<void> => {
  const tokens = await getTokens();
  if (!tokens?.refresh_token) throw new Error("No refresh token available");

  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    throw new Error("X_CLIENT_ID and X_CLIENT_SECRET must be set");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
    client_id: clientId,
  });
  const res = await fetch(X_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
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
};

export const getValidAccessToken = async (): Promise<string> => {
  const tokens = await getTokens();
  if (!tokens) throw new Error("Not authenticated. Connect X account first.");

  const now = Date.now();
  const bufferMs = 60 * 1000; // refresh 1 min before expiry
  if (tokens.expires_at > now + bufferMs) return tokens.access_token;

  await refreshTokens();
  const updated = await getTokens();
  if (!updated) throw new Error("Token refresh failed");
  return updated.access_token;
};

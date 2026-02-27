import { getTokens, updateTokens } from "./tokenStore";

const X_API_BASE = "https://api.x.com/2";

async function getValidAccessToken(): Promise<string> {
  const tokens = await getTokens();
  if (!tokens) {
    throw new Error("Not authenticated. Connect X account first.");
  }
  const now = Date.now();
  const bufferMs = 60 * 1000; // refresh 1 min before expiry
  if (tokens.expires_at > now + bufferMs) {
    return tokens.access_token;
  }
  await refreshTokens();
  const updated = await getTokens();
  if (!updated) throw new Error("Token refresh failed");
  return updated.access_token;
}

async function refreshTokens(): Promise<void> {
  const tokens = await getTokens();
  if (!tokens?.refresh_token) {
    throw new Error("No refresh token available");
  }
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("X_CLIENT_ID and X_CLIENT_SECRET must be set");
  }
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tokens.refresh_token,
    client_id: clientId,
  });
  const res = await fetch(`${X_API_BASE.replace("/2", "")}/2/oauth2/token`, {
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
}

/**
 * Post a reply to a tweet. On 401, refreshes the token and retries once.
 */
export async function postReply(
  text: string,
  tweetId: string,
): Promise<{ data: { id: string } }> {
  const accessToken = await getValidAccessToken();

  const doPost = async (token: string) => {
    const res = await fetch(`${X_API_BASE}/tweets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        reply: { in_reply_to_tweet_id: tweetId },
      }),
    });
    return { res, ok: res.ok, status: res.status };
  };

  let result = await doPost(accessToken);

  if (result.status === 401) {
    await refreshTokens();
    const newTokens = await getTokens();
    if (!newTokens) throw new Error("Refresh failed");
    result = await doPost(newTokens.access_token);
  }

  if (!result.ok) {
    const err = await result.res.text();
    throw new Error(`X API error: ${result.status} ${err}`);
  }

  return result.res.json() as Promise<{ data: { id: string } }>;
}

import { getTokens } from "@/lib/tokenStore";

import { getValidAccessToken, refreshTokens } from "./auth";

const X_API_BASE = "https://api.x.com/2";

/** Get the authenticated user's id and profile (for timeline). */
export const getMe = async (): Promise<{
  id: string;
  username: string;
  name: string;
}> => {
  const accessToken = await getValidAccessToken();
  let res = await fetch(`${X_API_BASE}/users/me?user.fields=public_metrics`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) {
    await refreshTokens();
    const updated = await getTokens();
    if (updated) {
      res = await fetch(`${X_API_BASE}/users/me?user.fields=public_metrics`, {
        headers: { Authorization: `Bearer ${updated.access_token}` },
      });
    }
  }
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`X API users/me error: ${res.status} ${err}`);
  }

  const json = (await res.json()) as {
    data?: { id: string; username: string; name: string };
  };
  if (!json.data?.id) throw new Error("X API users/me returned no user");
  return json.data;
};


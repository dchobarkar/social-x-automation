import { getTokens } from "@/lib/tokenStore";

import { getValidAccessToken, refreshTokens } from "./auth";

const X_API_BASE = "https://api.x.com/2";

/**
 * Post a reply to a tweet. On 401, refreshes the token and retries once.
 */
export const postReply = async (
  text: string,
  tweetId: string,
): Promise<{ data: { id: string } }> => {
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
    const errText = await result.res.text();
    let message = errText;
    try {
      const parsed = JSON.parse(errText) as { detail?: string; title?: string };
      if (typeof parsed.detail === "string" && parsed.detail) {
        message = parsed.detail;
      } else if (typeof parsed.title === "string" && parsed.title) {
        message = parsed.title;
      }
    } catch {
      message =
        result.status === 403 ? errText : `X API error: ${result.status} ${errText}`;
    }
    throw new Error(message);
  }
  return result.res.json() as Promise<{ data: { id: string } }>;
};


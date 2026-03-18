// X dashboard UI constants: reply variant labels, tweet card UI, and X (Twitter) URL helpers.

// Character length after which tweet text is collapsed in the card. */
export const POST_COLLAPSE_LENGTH = 200;

export const REPLY_VARIANT_HUMOROUS = "Humorous" as const;
export const REPLY_VARIANT_INSIGHTFUL = "Insightful" as const;
export const REPLY_PLACEHOLDER_HUMOROUS = "Light, witty reply…";
export const REPLY_PLACEHOLDER_INSIGHTFUL = "Add perspective or value…";
export const TWITTER_INTENT_BASE = "https://twitter.com/intent/tweet";

export const buildTwitterReplyIntent = (
  tweetId: string,
  text: string,
): string => {
  if (!text.trim()) return "#";

  return `${TWITTER_INTENT_BASE}?in_reply_to=${encodeURIComponent(tweetId)}&text=${encodeURIComponent(text)}`;
};

/** Open the tweet on X (status page). */
export const buildTweetViewUrl = (
  tweetId: string,
  username?: string | null,
): string => {
  if (username?.trim()) {
    return `https://x.com/${username.replace(/^@/, "").trim()}/status/${tweetId}`;
  }
  return `https://x.com/i/status/${tweetId}`;
};

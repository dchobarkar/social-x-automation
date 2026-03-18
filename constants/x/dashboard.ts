// X dashboard UI constants: reply variant labels, tweet card UI, and X (Twitter) URL helpers.

// Character length after which tweet text is collapsed in the card. */
export const POST_COLLAPSE_LENGTH = 200;

export const REPLY_VARIANT_HELPFUL = "Helpful" as const;
export const REPLY_VARIANT_INSIGHTFUL = "Insightful" as const;
export const REPLY_VARIANT_WITTY = "Witty" as const;
export const REPLY_VARIANT_EMPATHETIC = "Empathetic" as const;
export const REPLY_VARIANT_PROFESSIONAL = "Professional" as const;

export const REPLY_PLACEHOLDER_HELPFUL = "Offer a clear, useful answer…";
export const REPLY_PLACEHOLDER_INSIGHTFUL = "Add perspective or value…";
export const REPLY_PLACEHOLDER_WITTY = "Light, clever, and on-topic…";
export const REPLY_PLACEHOLDER_EMPATHETIC = "Show understanding and care…";
export const REPLY_PLACEHOLDER_PROFESSIONAL =
  "Polished, respectful, and on-brand…";
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
  if (username?.trim())
    return `https://x.com/${username.replace(/^@/, "").trim()}/status/${tweetId}`;

  return `https://x.com/i/status/${tweetId}`;
};

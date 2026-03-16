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

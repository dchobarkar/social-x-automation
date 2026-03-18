import type { ReplyTone } from "@/types/ai/replies";

export const X_POST_COLLAPSE_LENGTH = 200;

export const X_REPLY_DRAFT_TONE_LABELS: Record<ReplyTone, string> = {
  helpful: "Helpful",
  insightful: "Insightful",
  witty: "Witty",
  empathetic: "Empathetic",
  professional: "Professional",
};

export const X_REPLY_DRAFT_PLACEHOLDERS: Record<ReplyTone, string> = {
  helpful: "Offer a clear, useful answer…",
  insightful: "Add perspective or value…",
  witty: "Light, clever, and on-topic…",
  empathetic: "Show understanding and care…",
  professional: "Polished, respectful, and on-brand…",
};

const X_REPLY_INTENT_BASE_URL = "https://x.com/intent/tweet";

export const buildXReplyIntentUrl = (tweetId: string, text: string): string => {
  if (!text.trim()) return "#";

  return `${X_REPLY_INTENT_BASE_URL}?in_reply_to=${encodeURIComponent(tweetId)}&text=${encodeURIComponent(text)}`;
};

export const buildXPostUrl = (
  tweetId: string,
  username?: string | null,
): string => {
  if (username?.trim())
    return `https://x.com/${username.replace(/^@/, "").trim()}/status/${tweetId}`;

  return `https://x.com/i/status/${tweetId}`;
};

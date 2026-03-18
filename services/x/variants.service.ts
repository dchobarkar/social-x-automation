import type { ReplyVariants } from "@/types/ai";

import { generateReplyVariantsForPost } from "@/services/ai/replies/processPost";

export const generateXReplyVariants = async (
  tweetText: string,
): Promise<ReplyVariants> => {
  if (!process.env.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY is not set in .env.local");

  return generateReplyVariantsForPost(tweetText, "x");
};

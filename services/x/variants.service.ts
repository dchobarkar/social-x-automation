import type { ReplyVariants } from "@/types/ai";

import { generateReplyVariants } from "@/integrations/openai/replyVariants";

export const generateXReplyVariants = async (
  tweetText: string,
): Promise<ReplyVariants> => {
  if (!process.env.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY is not set in .env.local");

  return generateReplyVariants(tweetText);
};

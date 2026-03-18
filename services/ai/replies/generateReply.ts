import { getOpenAI } from "@/integrations/openai/client";

import type { PlatformId, PostIntent, ReplyTone } from "./types";
import { getGenerateReplyPrompt } from "./prompts";

export interface GenerateReplyInput {
  post: string;
  tone: ReplyTone;
  intent: PostIntent;
  platform: PlatformId;
}

export const generateReply = async ({
  post,
  tone,
  intent,
  platform,
}: GenerateReplyInput): Promise<string> => {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: getGenerateReplyPrompt(platform) },
      {
        role: "user",
        content: JSON.stringify({ post, tone, intent }),
      },
    ],
    max_tokens: 280,
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI returned no reply content");
  return content;
};

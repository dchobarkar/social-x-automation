import { getOpenAI } from "@/integrations/openai/client";

import type { PlatformId, ReplyValidation } from "./types";
import { getValidateReplyPrompt } from "./prompts";

export const validateReply = async (
  reply: string,
  post: string,
  platform: PlatformId,
): Promise<ReplyValidation> => {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: getValidateReplyPrompt(platform) },
      {
        role: "user",
        content: JSON.stringify({ post, reply }),
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned no validation content");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse OpenAI JSON for reply validation");
  }

  const data = parsed as Partial<ReplyValidation>;
  return {
    isSafe: data.isSafe ?? false,
    score: data.score ?? 0,
    issues: Array.isArray(data.issues) ? data.issues : [],
  };
};

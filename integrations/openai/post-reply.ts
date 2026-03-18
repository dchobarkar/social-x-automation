import {
  OPENAI_DEFAULT_MODEL,
  OPENAI_REPLY_SYSTEM_PROMPT,
} from "@/constants/ai";
import { getOpenAI } from "./client";

export const generateReply = async (tweetText: string): Promise<string> => {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: OPENAI_DEFAULT_MODEL,
    messages: [
      { role: "system", content: OPENAI_REPLY_SYSTEM_PROMPT },
      { role: "user", content: tweetText },
    ],
    max_tokens: 280,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) throw new Error("OpenAI returned no reply content");
  return content;
};

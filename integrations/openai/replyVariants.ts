import type { ReplyVariants } from "@/types/ai";
import {
  OPENAI_DEFAULT_MODEL,
  OPENAI_REPLY_SYSTEM_PROMPT,
  OPENAI_VARIANTS_SYSTEM_PROMPT,
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

export const generateReplyVariants = async (
  tweetText: string,
): Promise<ReplyVariants> => {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: OPENAI_DEFAULT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: OPENAI_VARIANTS_SYSTEM_PROMPT },
      { role: "user", content: tweetText },
    ],
    max_tokens: 400,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned no content for variants");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.log(error);
    throw new Error("Failed to parse OpenAI JSON for variants");
  }

  const obj = parsed as Partial<ReplyVariants>;

  const coerce = (value: unknown): string | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
  };

  const variants: ReplyVariants = {
    helpful: coerce(obj.helpful),
    insightful: coerce(obj.insightful),
    witty: coerce(obj.witty),
    empathetic: coerce(obj.empathetic),
    professional: coerce(obj.professional),
  };

  if (
    !variants.helpful &&
    !variants.insightful &&
    !variants.witty &&
    !variants.empathetic &&
    !variants.professional
  ) {
    throw new Error("OpenAI variants missing all reply tones");
  }

  return variants;
};

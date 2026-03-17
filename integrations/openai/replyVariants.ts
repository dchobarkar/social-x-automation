import type { ReplyVariants } from "@/types/ai";
import { getOpenAI, OPENAI_DEFAULT_MODEL } from "./client";

const SYSTEM_PROMPT =
  "You are a thoughtful developer engaging on X. Write concise, intelligent, non-spammy replies.";

export const generateReply = async (tweetText: string): Promise<string> => {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: OPENAI_DEFAULT_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
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
      {
        role: "system",
        content:
          "You are helping craft replies to X (Twitter) posts. " +
          "Given the original tweet text, return a JSON object with two keys: " +
          '"humorous" and "insightful". Each value must be a concise, natural-sounding reply. ' +
          "The humorous reply should be light, witty, and non-offensive. " +
          "The insightful reply should add genuine perspective or value. " +
          "Do not include explanations, only the JSON object.",
      },
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
  const humorous = (obj.humorous ?? "").toString().trim();
  const insightful = (obj.insightful ?? "").toString().trim();

  if (!humorous || !insightful)
    throw new Error("OpenAI variants missing humorous or insightful reply");
  return { humorous, insightful };
};

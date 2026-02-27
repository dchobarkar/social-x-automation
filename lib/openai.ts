import OpenAI from "openai";

const getOpenAI = (): OpenAI => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is missing; set it in .env.local");

  return new OpenAI({ apiKey: key });
};

const SYSTEM_PROMPT =
  "You are a thoughtful developer engaging on X. Write concise, intelligent, non-spammy replies.";

// Generate a single AI reply suggestion for a given tweet text.
export async function generateReply(tweetText: string): Promise<string> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: tweetText },
    ],
    max_tokens: 280,
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned no reply content");
  }
  return content;
}

export type ReplyVariants = {
  humorous: string;
  insightful: string;
};

// Generate two variants (humorous + insightful) for a tweet.
export async function generateReplyVariants(
  tweetText: string,
): Promise<ReplyVariants> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
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
  if (!raw) {
    throw new Error("OpenAI returned no content for variants");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error("Failed to parse OpenAI JSON for variants");
  }

  const obj = parsed as Partial<ReplyVariants>;
  const humorous = (obj.humorous ?? "").toString().trim();
  const insightful = (obj.insightful ?? "").toString().trim();

  if (!humorous || !insightful) {
    throw new Error("OpenAI variants missing humorous or insightful reply");
  }

  return { humorous, insightful };
}

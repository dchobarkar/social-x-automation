import OpenAI from "openai";

const getOpenAI = (): OpenAI => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is missing; set it in .env.local");

  return new OpenAI({ apiKey: key });
};

const SYSTEM_PROMPT =
  "You are a thoughtful developer engaging on X. Write concise, intelligent, non-spammy replies.";

// Generate an AI reply suggestion for a given tweet text.
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

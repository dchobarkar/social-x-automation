import OpenAI from "openai";

export const getOpenAI = (): OpenAI => {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is missing; set it in .env.local");

  return new OpenAI({ apiKey: key });
};

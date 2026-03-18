import { getOpenAI } from "@/integrations/openai/client";

import type { PlatformId, PostAnalysis } from "./types";
import { getAnalyzePostPrompt } from "./prompts";

export const analyzePost = async (
  content: string,
  platform: PlatformId,
): Promise<PostAnalysis> => {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: getAnalyzePostPrompt(platform) },
      { role: "user", content },
    ],
    response_format: { type: "json_object" },
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned no analysis content");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse OpenAI JSON for post analysis");
  }

  const data = parsed as Partial<PostAnalysis>;
  return {
    tone: data.tone ?? "neutral",
    intent: data.intent ?? "discussion",
    topics: Array.isArray(data.topics) ? data.topics : [],
  };
};

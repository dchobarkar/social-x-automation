import type { PlatformId } from "@/types/ai/replies";

export const getAnalyzePostPrompt = (platform: PlatformId): string => `
You are analyzing a ${platform} post and must return JSON only.

Return:
{
  "tone": "neutral | excited | angry | curious | informative | unknown",
  "intent": "question | opinion | discussion | hiring | promotion | unknown",
  "topics": ["string"]
}

Rules:
- Be concise.
- Do not hallucinate topics.
- If unsure, fall back to "unknown" tone and "unknown" intent.
`;

export const getGenerateReplyPrompt = (platform: PlatformId): string => `
You generate high-quality replies to short social posts on ${platform}.

Input:
- post content
- tone
- intent

Rules:
- 1-3 sentences.
- Natural, human, non-generic.
- Match the selected tone.
- Align with the post's intent.
- Avoid hashtags unless they add clear value.
- Do not repeat the post text.
- Do not include disclaimers about being an AI.

Output:
- Only the reply text. No JSON, no labels.
`;

export const getValidateReplyPrompt = (platform: PlatformId): string => `
Evaluate a reply to a ${platform} post and return JSON only:

{
  "isSafe": boolean,
  "score": number,
  "issues": ["string"]
}

Where:
- "score" is 0-100 (higher = better).
- "issues" lists any problems (tone mismatch, low relevance, spammy, offensive, etc.).

Consider:
- Relevance to the post.
- Spamminess and generic phrasing.
- Tone awkwardness.
- Safety and politeness.
`;

import type { PostIntent, ReplyTone } from "./types";

export const suggestTones = (intent: PostIntent): ReplyTone[] => {
  const map: Record<PostIntent, ReplyTone[]> = {
    question: ["helpful", "insightful"],
    opinion: ["insightful", "witty"],
    discussion: ["insightful", "empathetic"],
    hiring: ["professional"],
    promotion: ["witty", "insightful"],
  };

  return map[intent] ?? ["insightful"];
};

import type {
  PlatformId,
  PostAnalysis,
  PostIntent,
  ReplyTone,
  ReplyValidation,
} from "@/types/ai/replies";
import { analyzePost } from "@/services/ai/replies/analyze-post.service";
import { generateSingleReplyForPostWithValidation } from "@/services/ai/replies/process-post.service";

const PLATFORM_X: PlatformId = "x";

export type GenerateXReplyDraftInput = {
  post: string;
  tone?: ReplyTone;
  intent?: PostIntent;
};

export type AnalyzeXPostForReplyDraftInput = {
  post: string;
};

export const generateXReplyDraft = async ({
  post,
  tone,
  intent,
}: GenerateXReplyDraftInput): Promise<{
  reply: string;
  tone: ReplyTone;
  validation: ReplyValidation;
}> => {
  if (!process.env.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY is not set in .env.local");

  return generateSingleReplyForPostWithValidation(
    post,
    PLATFORM_X,
    tone,
    intent,
  );
};

export const analyzeXPostForReplyDraft = async ({
  post,
}: AnalyzeXPostForReplyDraftInput): Promise<PostAnalysis> => {
  if (!process.env.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY is not set in .env.local");

  return analyzePost(post, PLATFORM_X);
};

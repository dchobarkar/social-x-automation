import type {
  PlatformId,
  PostAnalysis,
  ReplyTone,
  ReplyValidation,
} from "@/services/ai/replies/types";
import { analyzePost } from "@/services/ai/replies/analyze-post.service";
import {
  generateSingleReplyForPost,
  generateSingleReplyForPostWithValidation,
} from "@/services/ai/replies/process-post.service";

const PLATFORM_X: PlatformId = "x";

export type GenerateXReplyInput = {
  post: string;
  tone?: ReplyTone;
};

export type AnalyzeXPostInput = {
  post: string;
};

export const generateXReplyForPost = async ({
  post,
  tone,
}: GenerateXReplyInput): Promise<string> => {
  if (!process.env.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY is not set in .env.local");

  return generateSingleReplyForPost(post, PLATFORM_X, tone);
};

export const generateXReplyForPostWithValidation = async ({
  post,
  tone,
}: GenerateXReplyInput): Promise<{
  reply: string;
  tone: ReplyTone;
  validation: ReplyValidation;
}> => {
  if (!process.env.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY is not set in .env.local");

  return generateSingleReplyForPostWithValidation(post, PLATFORM_X, tone);
};

export const analyzeXPost = async ({
  post,
}: AnalyzeXPostInput): Promise<PostAnalysis> => {
  if (!process.env.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY is not set in .env.local");

  return analyzePost(post, PLATFORM_X);
};

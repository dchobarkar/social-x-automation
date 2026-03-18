import type { ReplyTone, ReplyValidation } from "@/types/ai/replies";

export type XReplyDraftUiState = {
  tone?: ReplyTone;
  loading?: boolean;
  analysisTone?: string;
  analysisIntent?: string;
  analysisTopics?: string[];
  analysisLoading?: boolean;
  analysisError?: string;
  validation?: ReplyValidation;
  validationLoading?: boolean;
  validationError?: string;
};

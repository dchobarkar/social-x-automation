import type {
  PostIntent,
  PostTone,
  ReplyTone,
  ReplyValidation,
} from "@/types/ai/replies";

export type XReplyDraftUiState = {
  tone?: ReplyTone;
  loading?: boolean;
  analysisTone?: PostTone;
  analysisIntent?: PostIntent;
  analysisTopics?: string[];
  analysisLoading?: boolean;
  analysisError?: string;
  validation?: ReplyValidation;
  validationLoading?: boolean;
  validationError?: string;
};

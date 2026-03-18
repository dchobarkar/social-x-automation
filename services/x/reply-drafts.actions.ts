"use server";

import type { ReplyTone } from "@/types/ai/replies";
import {
  analyzeXPostForReplyDraft,
  generateXReplyDraft,
} from "@/services/x/reply-drafts.service";

export const analyzeXPostAction = async (post: string) => {
  return analyzeXPostForReplyDraft({ post: post.trim() });
};

export const generateXReplyDraftAction = async (args: {
  post: string;
  tone?: ReplyTone;
}) => {
  return generateXReplyDraft({
    post: args.post.trim(),
    tone: args.tone,
  });
};

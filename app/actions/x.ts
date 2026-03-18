"use server";

import { redirect } from "next/navigation";

import { clearPkceStateFile } from "@/lib/storage/pkceStateStore";
import { clearTokens } from "@/lib/storage/tokenStore";
import { getSavedFeed, saveFeed } from "@/lib/storage/feedStore";
import { getHomeFeed } from "@/services/x/feed.service";
import {
  analyzeXPost,
  generateXReplyForPostWithValidation,
} from "@/services/x/replies.service";
import type { FeedFilters } from "@/types/x/feed";
import type { StoredTweet } from "@/types/x/tweet";
import type { ReplyTone } from "@/types/ai/replies";
import { ROUTES } from "@/constants/routes";

export const loadXFeedAction = async (
  filters: FeedFilters & { lastHours?: number },
) => {
  const nextFilters: FeedFilters = {
    maxResults:
      typeof filters.maxResults === "number"
        ? Math.min(Math.max(filters.maxResults, 1), 100)
        : 20,
    excludeReplies: filters.excludeReplies,
    excludeRetweets: filters.excludeRetweets,
    maxReplyCount: filters.maxReplyCount,
    minAuthorFollowers: filters.minAuthorFollowers,
    startTime: filters.startTime,
    endTime: filters.endTime,
  };

  if (
    typeof filters.lastHours === "number" &&
    Number.isFinite(filters.lastHours)
  ) {
    const d = new Date();
    d.setHours(d.getHours() - filters.lastHours);
    nextFilters.startTime = d.toISOString();
  }

  return getHomeFeed(nextFilters);
};

export const saveXFeedItemsAction = async (items: StoredTweet[]) => {
  await saveFeed(items);
};

export const getSavedXFeedAction = async () => {
  return getSavedFeed();
};

export const analyzeXPostAction = async (post: string) => {
  return analyzeXPost({ post: post.trim() });
};

export const generateXReplyAction = async (args: {
  post: string;
  tone?: ReplyTone;
}) => {
  return generateXReplyForPostWithValidation({
    post: args.post.trim(),
    tone: args.tone,
  });
};

export const signOutXAction = async () => {
  await Promise.all([clearTokens(), clearPkceStateFile()]);
  redirect(ROUTES.HOME);
};

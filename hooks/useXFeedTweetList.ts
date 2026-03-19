"use client";

import type { StoredTweet } from "@/types/x/tweet";
import { saveXFeedItemsAction } from "@/services/x/feed.actions";
import { useXTweetWorkspace } from "@/hooks/useXTweetWorkspace";

export const useXFeedTweetList = (initialItems: StoredTweet[] = []) =>
  useXTweetWorkspace({
    initialItems,
    saveItemsAction: saveXFeedItemsAction,
  });

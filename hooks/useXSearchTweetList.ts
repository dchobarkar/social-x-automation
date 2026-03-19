"use client";

import type { StoredTweet } from "@/types/x/tweet";
import { saveXSearchItemsAction } from "@/services/x/search.actions";
import { useXTweetWorkspace } from "@/hooks/useXTweetWorkspace";

export const useXSearchTweetList = (initialItems: StoredTweet[] = []) =>
  useXTweetWorkspace({
    initialItems,
    saveItemsAction: saveXSearchItemsAction,
  });

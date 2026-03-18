"use client";

import { useEffect } from "react";

import type { StoredTweet } from "@/types/x/tweet";
import { getSavedItems } from "@/utils/savedItems";

export const useLoadSavedTweets = ({
  endpoint,
  onLoad,
}: {
  endpoint: string;
  onLoad: (items: StoredTweet[]) => void;
}): void => {
  useEffect(() => {
    let cancelled = false;
    getSavedItems(endpoint).then((items) => {
      if (cancelled || items.length === 0) return;
      onLoad(items);
    });
    return () => {
      cancelled = true;
    };
  }, [endpoint, onLoad]);
};

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ReplyTone } from "@/types/ai/replies";
import type { FlashMessage } from "@/types/ui";
import type { StoredTweet, VariantChoice } from "@/types/x/tweet";
import type { XReplyDraftUiState } from "@/types/x/reply-drafts";
import {
  analyzeXPostAction,
  generateXReplyDraftAction,
} from "@/services/x/reply-drafts.actions";

export type UseXTweetWorkspaceOptions = {
  initialItems?: StoredTweet[];
  saveItemsAction: (items: StoredTweet[]) => Promise<void>;
};

export const useXTweetWorkspace = ({
  initialItems = [],
  saveItemsAction,
}: UseXTweetWorkspaceOptions) => {
  const [items, setItems] = useState<StoredTweet[]>(initialItems);
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const [loadingReplyForId, setLoadingReplyForId] = useState<string | null>(
    null,
  );
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyUiByTweetId, setReplyUiByTweetId] = useState<
    Record<string, XReplyDraftUiState>
  >({});
  const hasMountedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      void saveItemsAction(items);
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [items, saveItemsAction]);

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
  }, []);

  const replaceItems = useCallback((next: StoredTweet[]) => {
    setItems(next);
  }, []);

  const updateItems = useCallback(
    (updater: (currentItems: StoredTweet[]) => StoredTweet[]) => {
      setItems((prev) => updater(prev));
    },
    [],
  );

  const handleChangeSelection = useCallback(
    (id: string, choice: VariantChoice) => {
      updateItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, selected: choice } : item,
        ),
      );
    },
    [updateItems],
  );

  const handleDeleteTweet = useCallback(
    (id: string) => {
      updateItems((prev) => prev.filter((item) => item.id !== id));
      setReplyingToId((curr) => (curr === id ? null : curr));
      setReplyUiByTweetId((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
    },
    [updateItems],
  );

  const handleReplyClick = useCallback(
    async (item: StoredTweet) => {
      const isOpen = replyingToId === item.id;
      if (isOpen) {
        setReplyingToId(null);
        return;
      }

      const existingReplyUi = replyUiByTweetId[item.id];
      const hasCachedAnalysis =
        existingReplyUi?.analysisError == null &&
        (existingReplyUi?.analysisTone != null ||
          existingReplyUi?.analysisIntent != null ||
          (existingReplyUi?.analysisTopics?.length ?? 0) > 0);

      setReplyingToId(item.id);
      setReplyUiByTweetId((prev) => ({
        ...prev,
        [item.id]: {
          tone: prev[item.id]?.tone ?? item.selected ?? "insightful",
          loading: false,
          analysisTone: prev[item.id]?.analysisTone,
          analysisIntent: prev[item.id]?.analysisIntent,
          analysisTopics: prev[item.id]?.analysisTopics,
          analysisLoading: hasCachedAnalysis
            ? false
            : (prev[item.id]?.analysisLoading ?? true),
          analysisError: undefined,
          validation: undefined,
          validationLoading: false,
          validationError: undefined,
        },
      }));

      if (hasCachedAnalysis) return;

      try {
        const analysis = await analyzeXPostAction(item.text);

        setReplyUiByTweetId((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            analysisTone: analysis.tone ?? prev[item.id]?.analysisTone,
            analysisIntent: analysis.intent ?? prev[item.id]?.analysisIntent,
            analysisTopics: analysis.topics ?? prev[item.id]?.analysisTopics,
            analysisLoading: false,
          },
        }));
      } catch (e) {
        setReplyUiByTweetId((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            analysisLoading: false,
            analysisError:
              e instanceof Error ? e.message : "Failed to analyze post",
          },
        }));
      }
    },
    [replyUiByTweetId, replyingToId],
  );

  const setReplyTone = useCallback((id: string, tone: ReplyTone) => {
    setReplyUiByTweetId((prev) => ({
      ...prev,
      [id]: { ...prev[id], tone },
    }));
  }, []);

  const generateReplyForId = useCallback(
    async (id: string) => {
      const item = items.find((candidate) => candidate.id === id);
      if (!item) return;

      const tone = replyUiByTweetId[id]?.tone ?? item.selected ?? "insightful";
      setLoadingReplyForId(id);
      setReplyUiByTweetId((prev) => ({
        ...prev,
        [id]: { ...prev[id], loading: true, validationLoading: true },
      }));
      setMessage(null);

      try {
        const data = await generateXReplyDraftAction({ post: item.text, tone });
        const toneUsed = (data.tone ?? tone) as ReplyTone;

        setReplyUiByTweetId((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            tone: toneUsed,
            validation: data.validation,
            validationLoading: false,
            loading: false,
          },
        }));

        updateItems((prev) =>
          prev.map((tweet) =>
            tweet.id === id ? { ...tweet, [toneUsed]: data.reply } : tweet,
          ),
        );
      } catch (e) {
        showMessage(
          "error",
          e instanceof Error ? e.message : "Failed to generate reply",
        );
        setReplyUiByTweetId((prev) => ({
          ...prev,
          [id]: { ...prev[id], loading: false, validationLoading: false },
        }));
      } finally {
        setLoadingReplyForId(null);
      }
    },
    [items, replyUiByTweetId, showMessage, updateItems],
  );

  return {
    items,
    replaceItems,
    updateItems,
    message,
    setMessage,
    showMessage,
    loadingReplyForId,
    replyingToId,
    setReplyingToId,
    replyUiByTweetId,
    handleChangeSelection,
    handleDeleteTweet,
    handleReplyClick,
    setReplyTone,
    generateReplyForId,
  };
};

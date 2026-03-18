"use client";

import { useCallback, useState } from "react";

import type { StoredTweet, VariantChoice } from "@/types/x/tweet";
import type { ReplyTone, ReplyValidation } from "@/types/ai/replies";
import type { FlashMessage } from "@/types/ui";
import {
  analyzeXPostAction,
  generateXReplyAction,
  saveXFeedItemsAction,
} from "@/app/actions/x";

export type ReplyUIState = {
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

export const useTweetList = (initialItems: StoredTweet[] = []) => {
  const [items, setItems] = useState<StoredTweet[]>(initialItems);
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const [loadingReplyForId, setLoadingReplyForId] = useState<string | null>(
    null,
  );
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyUI, setReplyUI] = useState<Record<string, ReplyUIState>>({});

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
  }, []);
  const replaceItems = useCallback((next: StoredTweet[]) => {
    setItems(next);
    void saveXFeedItemsAction(next);
  }, []);
  const handleChangeSelection = useCallback(
    (id: string, choice: VariantChoice) => {
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, selected: choice } : item,
        );
        void saveXFeedItemsAction(next);
        return next;
      });
    },
    [],
  );
  const updateItem = useCallback(
    (id: string, partial: Partial<StoredTweet>) => {
      setItems((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, ...partial } : item,
        );
        void saveXFeedItemsAction(next);
        return next;
      });
    },
    [],
  );
  const updateItems = useCallback(
    (updater: (items: StoredTweet[]) => StoredTweet[]) => {
      setItems((prev) => {
        const next = updater(prev);
        void saveXFeedItemsAction(next);
        return next;
      });
    },
    [],
  );
  const handleDeleteTweet = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== id);
        void saveXFeedItemsAction(next);
        return next;
      });
      setReplyingToId((curr) => (curr === id ? null : curr));
      setReplyUI((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
    },
    [],
  );
  const handleReplyClick = useCallback(
    async (item: StoredTweet) => {
      const isOpen = replyingToId === item.id;
      if (isOpen) {
        setReplyingToId(null);
        return;
      }
      setReplyingToId(item.id);
      setReplyUI((prev) => ({
        ...prev,
        [item.id]: {
          tone: prev[item.id]?.tone ?? item.selected ?? "insightful",
          loading: false,
          analysisTone: prev[item.id]?.analysisTone,
          analysisIntent: prev[item.id]?.analysisIntent,
          analysisTopics: prev[item.id]?.analysisTopics,
          analysisLoading: prev[item.id]?.analysisLoading ?? true,
          analysisError: undefined,
          validation: undefined,
          validationLoading: false,
          validationError: undefined,
        },
      }));

      try {
        const analysis = await analyzeXPostAction(item.text);

        setReplyUI((prev) => ({
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
        setReplyUI((prev) => ({
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
    [replyingToId],
  );

  const setReplyTone = useCallback((id: string, tone: ReplyTone) => {
    setReplyUI((prev) => ({
      ...prev,
      [id]: { ...prev[id], tone },
    }));
  }, []);

  const generateReplyForId = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const tone = replyUI[id]?.tone ?? item.selected ?? "insightful";
      setLoadingReplyForId(id);

      setReplyUI((prev) => ({
        ...prev,
        [id]: { ...prev[id], loading: true, validationLoading: true },
      }));
      setMessage(null);

      try {
        const data = await generateXReplyAction({ post: item.text, tone });
        const toneUsed = (data.tone ?? tone) as ReplyTone;

        if (data.validation) {
          setReplyUI((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              tone: toneUsed,
              validation: data.validation,
              validationLoading: false,
              loading: false,
            },
          }));
        } else {
          setReplyUI((prev) => ({
            ...prev,
            [id]: {
              ...prev[id],
              tone: toneUsed,
              validationLoading: false,
              loading: false,
            },
          }));
        }

        setItems((prev) => {
          const next = prev.map((tweet) =>
            tweet.id === id && data.reply
              ? { ...tweet, [toneUsed]: data.reply }
              : tweet,
          );
          void saveXFeedItemsAction(next);
          return next;
        });
      } catch (e) {
        showMessage(
          "error",
          e instanceof Error ? e.message : "Failed to generate reply",
        );
        setReplyUI((prev) => ({
          ...prev,
          [id]: { ...prev[id], loading: false, validationLoading: false },
        }));
      } finally {
        setLoadingReplyForId(null);
      }
    },
    [items, replyUI, showMessage],
  );

  return {
    items,
    setItems,
    replaceItems,
    message,
    setMessage,
    showMessage,
    loadingReplyForId,
    replyingToId,
    setReplyingToId,
    replyUI,
    handleChangeSelection,
    handleDeleteTweet,
    handleReplyClick,
    updateItem,
    updateItems,
    setReplyTone,
    generateReplyForId,
  };
};

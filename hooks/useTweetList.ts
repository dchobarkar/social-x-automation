"use client";

import { useCallback, useState } from "react";

import type { StoredTweet, VariantChoice } from "@/types/x/tweet";
import type { ReplyTone, ReplyValidation } from "@/types/ai/replies";
import type { FlashMessage } from "@/types/ui";
import { ROUTES } from "@/constants/routes";
import { postJson } from "@/utils/http";
import { persistSavedItems } from "@/utils/savedItems";

type SaveEndpoint =
  | typeof ROUTES.API_X_FEED_SAVED
  | typeof ROUTES.API_X_SEARCH_SAVED;

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

export const useTweetList = (saveEndpoint: SaveEndpoint) => {
  const [items, setItems] = useState<StoredTweet[]>([]);
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const [loadingReplyForId, setLoadingReplyForId] = useState<string | null>(
    null,
  );
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [postingForId, setPostingForId] = useState<string | null>(null);
  const [replyUI, setReplyUI] = useState<Record<string, ReplyUIState>>({});

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
  }, []);
  const handleChangeSelection = useCallback(
    (id: string, choice: VariantChoice) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, selected: choice } : item,
        ),
      );
    },
    [],
  );
  const updateItem = useCallback(
    (id: string, partial: Partial<StoredTweet>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...partial } : item)),
      );
    },
    [],
  );
  const handleDeleteTweet = useCallback(
    (id: string) => {
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== id);
        persistSavedItems(saveEndpoint, next);
        return next;
      });
      setReplyingToId((curr) => (curr === id ? null : curr));
      setReplyUI((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _removed, ...rest } = prev;
        return rest;
      });
    },
    [saveEndpoint],
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
        const { res, data } = await postJson<{
          analysis?: {
            tone?: string;
            intent?: string;
            topics?: string[];
          };
          error?: string;
        }>(ROUTES.API_X_REPLIES_ANALYZE, { post: item.text });

        if (!res.ok || !data.analysis) {
          throw new Error(data.error ?? "Analyze post failed");
        }

        setReplyUI((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            analysisTone: data.analysis?.tone ?? prev[item.id]?.analysisTone,
            analysisIntent:
              data.analysis?.intent ?? prev[item.id]?.analysisIntent,
            analysisTopics:
              data.analysis?.topics ?? prev[item.id]?.analysisTopics,
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
        const { res, data } = await postJson<{
          reply?: string;
          validation?: ReplyValidation;
          tone?: ReplyTone;
          error?: string;
        }>(ROUTES.API_X_REPLIES_GENERATE, { post: item.text, tone });

        const toneUsed = (data.tone ?? tone) as ReplyTone;

        if (data.reply) {
          setItems((prev) =>
            prev.map((tweet) =>
              tweet.id === id ? { ...tweet, [toneUsed]: data.reply } : tweet,
            ),
          );
        }

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
          // Backend should always return validation, but keep a safe fallback.
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

        if (!res.ok) {
          if (data.validation) {
            // Validation response is already stored; don't throw.
            return;
          }
          throw new Error(data.error ?? "Generate reply failed");
        }
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
  const handlePostFor = useCallback(
    async (id: string) => {
      const tweet = items.find((t) => t.id === id);
      const chosenText = tweet ? (tweet[tweet.selected] ?? "").toString() : "";
      if (!chosenText?.trim()) {
        showMessage("error", "Reply is empty.");
        return;
      }
      setPostingForId(id);
      setMessage(null);
      try {
        const { res, data } = await postJson<{ error?: string }>(
          ROUTES.API_X_REPLY,
          { tweetId: id, text: chosenText.trim() },
        );
        if (!res.ok) throw new Error(data.error ?? "Post failed");
        showMessage("success", "Reply posted successfully.");
        setReplyingToId(null);
        const nextItems = items.filter((i) => i.id !== id);
        setItems(nextItems);
        await persistSavedItems(saveEndpoint, nextItems);
        setReplyUI((prev) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [id]: _removed, ...rest } = prev;
          return rest;
        });
      } catch (e) {
        showMessage(
          "error",
          e instanceof Error ? e.message : "Failed to post reply",
        );
      } finally {
        setPostingForId(null);
      }
    },
    [items, saveEndpoint, showMessage],
  );

  return {
    items,
    setItems,
    message,
    setMessage,
    showMessage,
    loadingReplyForId,
    replyingToId,
    setReplyingToId,
    postingForId,
    replyUI,
    handleChangeSelection,
    handleDeleteTweet,
    handleReplyClick,
    handlePostFor,
    updateItem,
    setReplyTone,
    generateReplyForId,
  };
};

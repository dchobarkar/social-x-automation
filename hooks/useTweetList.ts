"use client";

import { useCallback, useState } from "react";

import type { StoredTweet, VariantChoice } from "@/types/x/tweet";
import type { FlashMessage } from "@/types/ui";
import { ROUTES } from "@/constants/routes";
import { postJson } from "@/utils/http";
import { persistSavedItems } from "@/utils/savedItems";

type SaveEndpoint =
  | typeof ROUTES.API_X_FEED_SAVED
  | typeof ROUTES.API_X_SEARCH_SAVED;

export const useTweetList = (saveEndpoint: SaveEndpoint) => {
  const [items, setItems] = useState<StoredTweet[]>([]);
  const [message, setMessage] = useState<FlashMessage | null>(null);
  const [loadingReplyForId, setLoadingReplyForId] = useState<string | null>(
    null,
  );
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [postingForId, setPostingForId] = useState<string | null>(null);

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
    (
      id: string,
      partial: Partial<Pick<StoredTweet, "humorous" | "insightful">>,
    ) => {
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
      const hasVariants =
        (item.humorous ?? "").trim() !== "" ||
        (item.insightful ?? "").trim() !== "";
      if (hasVariants) return;
      setLoadingReplyForId(item.id);
      setMessage(null);
      try {
        const { res, data } = await postJson<{
          humorous?: string;
          insightful?: string;
          error?: string;
        }>(ROUTES.API_X_GENERATE_VARIANTS, { tweetText: item.text });
        if (!res.ok) {
          const msg =
            typeof data?.error === "string" ? data.error : "Generate failed";
          throw new Error(msg);
        }
        const updatedItem = {
          humorous: data.humorous ?? "",
          insightful: data.insightful ?? "",
          selected: "humorous" as VariantChoice,
        };
        setItems((prev) => {
          const next = prev.map((it) =>
            it.id === item.id ? { ...it, ...updatedItem } : it,
          );
          persistSavedItems(saveEndpoint, next);
          return next;
        });
      } catch (e) {
        showMessage(
          "error",
          e instanceof Error ? e.message : "Failed to generate reply options",
        );
      } finally {
        setLoadingReplyForId(null);
      }
    },
    [replyingToId, saveEndpoint, showMessage],
  );

  const handlePostFor = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      const chosenText =
        item.selected === "humorous" ? item.humorous : item.insightful;
      if (!chosenText?.trim()) {
        showMessage("error", "Selected reply is empty.");
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
        const next = items.filter((i) => i.id !== id);
        setItems(next);
        await persistSavedItems(saveEndpoint, next);
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
    handleChangeSelection,
    handleDeleteTweet,
    handleReplyClick,
    handlePostFor,
    updateItem,
  };
};

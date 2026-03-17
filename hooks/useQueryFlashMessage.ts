"use client";

import { useEffect, useState } from "react";

import type { FlashMessage } from "@/types/ui";

export const useQueryFlashMessage = (
  args: {
    /**
     * Called after consuming the query params (e.g. to clean the URL).
     * Typical: () => window.history.replaceState({}, "", "/dashboard/x")
     */
    onConsume?: () => void;
    successMessage?: string;
  } = {},
): FlashMessage | null => {
  const [message, setMessage] = useState<FlashMessage | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const success = params.get("success");

    if (error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage({ type: "error", text: decodeURIComponent(error) });
      args.onConsume?.();
      return;
    }

    if (success) {
      setMessage({
        type: "success",
        text: args.successMessage ?? "Success.",
      });
      args.onConsume?.();
    }
  }, [args]);

  return message;
};

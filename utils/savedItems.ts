import type { StoredTweet } from "@/types/tweet";
import { postJson, safeJson } from "@/utils/http";

/**
 * Fetch saved items from a GET endpoint that returns { items: StoredTweet[] }.
 */
export const getSavedItems = async (
  endpoint: string,
): Promise<StoredTweet[]> => {
  const res = await fetch(endpoint);
  const data = await safeJson<{ items?: StoredTweet[] }>(res, {});
  return Array.isArray(data.items) ? data.items : [];
};

/**
 * Persist items to a POST endpoint. Silently ignores errors (e.g. offline).
 */
export const persistSavedItems = async (
  endpoint: string,
  items: StoredTweet[],
): Promise<void> => {
  await postJson(endpoint, { items }).catch(() => {});
};

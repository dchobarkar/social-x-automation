import { mkdir, readFile, writeFile } from "node:fs/promises";

import type { StoredTweet } from "@/types/x/tweet";
import { getDataXDir, getSearchFilePath } from "@/constants/storage";

const ensureDataDir = async (): Promise<void> => {
  await mkdir(getDataXDir(), { recursive: true });
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const sanitizeStoredTweet = (value: unknown): StoredTweet | null => {
  if (!isObject(value)) return null;

  const id = typeof value.id === "string" ? value.id : "";
  const text = typeof value.text === "string" ? value.text : "";
  if (!id || !text) return null;

  const selected = typeof value.selected === "string" ? value.selected : "";

  const getOptionalString = (key: string) =>
    typeof value[key] === "string" ? (value[key] as string) : undefined;
  const getOptionalNumber = (key: string) =>
    typeof value[key] === "number" ? (value[key] as number) : undefined;

  return {
    id,
    text,
    selected:
      selected === "helpful" ||
      selected === "insightful" ||
      selected === "witty" ||
      selected === "empathetic" ||
      selected === "professional"
        ? selected
        : "insightful",
    author_username: getOptionalString("author_username"),
    author_name: getOptionalString("author_name"),
    author_profile_image_url: getOptionalString("author_profile_image_url"),
    created_at: getOptionalString("created_at"),
    author_followers_count: getOptionalNumber("author_followers_count"),
    public_metrics: isObject(value.public_metrics)
      ? {
          like_count: getOptionalNumberFromObject(
            value.public_metrics,
            "like_count",
          ),
          reply_count: getOptionalNumberFromObject(
            value.public_metrics,
            "reply_count",
          ),
          retweet_count: getOptionalNumberFromObject(
            value.public_metrics,
            "retweet_count",
          ),
          quote_count: getOptionalNumberFromObject(
            value.public_metrics,
            "quote_count",
          ),
        }
      : undefined,
  };
};

const getOptionalNumberFromObject = (
  value: Record<string, unknown>,
  key: string,
) => (typeof value[key] === "number" ? (value[key] as number) : undefined);

export const getSavedSearch = async (): Promise<StoredTweet[]> => {
  try {
    const raw = await readFile(getSearchFilePath(), "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => sanitizeStoredTweet(item))
      .filter((item): item is StoredTweet => item !== null);
  } catch {
    return [];
  }
};

export const saveSearch = async (items: StoredTweet[]): Promise<void> => {
  await ensureDataDir();
  await writeFile(getSearchFilePath(), JSON.stringify(items, null, 2), "utf8");
};

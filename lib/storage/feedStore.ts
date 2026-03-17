import { readFile, writeFile, mkdir } from "node:fs/promises";

import type { StoredTweet } from "@/types/x/tweet";
import { getDataXDir, getFeedFilePath } from "@/constants/storage";

const ensureDataDir = async (): Promise<void> => {
  await mkdir(getDataXDir(), { recursive: true });
};

export const getSavedFeed = async (): Promise<StoredTweet[]> => {
  try {
    const raw = await readFile(getFeedFilePath(), "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const saveFeed = async (items: StoredTweet[]): Promise<void> => {
  await ensureDataDir();
  await writeFile(getFeedFilePath(), JSON.stringify(items, null, 2), "utf8");
};

import { readFile, writeFile, mkdir } from "node:fs/promises";

import type { StoredTweet } from "@/types/x/tweet";
import { getDataXDir, getSearchFilePath } from "@/constants/storage";

const ensureDataDir = async (): Promise<void> => {
  await mkdir(getDataXDir(), { recursive: true });
};

export const getSavedSearch = async (): Promise<StoredTweet[]> => {
  try {
    const raw = await readFile(getSearchFilePath(), "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const saveSearch = async (items: StoredTweet[]): Promise<void> => {
  await ensureDataDir();
  await writeFile(getSearchFilePath(), JSON.stringify(items, null, 2), "utf8");
};

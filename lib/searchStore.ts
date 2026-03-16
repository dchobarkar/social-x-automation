import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import type { StoredTweet } from "@/types/tweet";

const DATA_X_DIR = path.join(process.cwd(), "data", "x");
const SEARCH_FILE_PATH = path.join(DATA_X_DIR, "search.json");

const ensureDataDir = async (): Promise<void> => {
  await mkdir(DATA_X_DIR, { recursive: true });
};

export const getSavedSearch = async (): Promise<StoredTweet[]> => {
  try {
    const raw = await readFile(SEARCH_FILE_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const saveSearch = async (items: StoredTweet[]): Promise<void> => {
  await ensureDataDir();
  await writeFile(SEARCH_FILE_PATH, JSON.stringify(items, null, 2), "utf8");
};

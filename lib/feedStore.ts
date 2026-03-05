import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "feed.json");

export type StoredTweet = {
  id: string;
  text: string;
  humorous?: string;
  insightful?: string;
  selected: "humorous" | "insightful";
  author_username?: string;
  author_name?: string;
  author_profile_image_url?: string;
  created_at?: string;
  public_metrics?: {
    reply_count?: number;
    like_count?: number;
    retweet_count?: number;
    quote_count?: number;
  };
  author_followers_count?: number;
};

const ensureDataDir = async (): Promise<void> => {
  await mkdir(DATA_DIR, { recursive: true });
};

export const getSavedFeed = async (): Promise<StoredTweet[]> => {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const saveFeed = async (items: StoredTweet[]): Promise<void> => {
  await ensureDataDir();
  await writeFile(FILE_PATH, JSON.stringify(items, null, 2), "utf8");
};

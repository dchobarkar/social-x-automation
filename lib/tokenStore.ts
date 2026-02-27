import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "tokens.json");

export type StoredTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix ms
};

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readTokens(): Promise<StoredTokens | null> {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
}

/**
 * Save tokens. expires_in is seconds from X API; we store expires_at in ms.
 */
export async function saveTokens(
  access_token: string,
  refresh_token: string,
  expires_in: number,
): Promise<void> {
  await ensureDataDir();
  const expires_at = Date.now() + expires_in * 1000;
  const data: StoredTokens = {
    access_token,
    refresh_token,
    expires_at,
  };
  await writeFile(FILE_PATH, JSON.stringify(data, null, 0), "utf8");
}

/**
 * Get stored tokens (server-side only).
 */
export async function getTokens(): Promise<StoredTokens | null> {
  return readTokens();
}

type TokenUpdate = Partial<Omit<StoredTokens, "expires_at">> & {
  expires_at?: number;
  expires_in?: number; // seconds from API
};

/**
 * Update stored tokens (e.g. after refresh).
 */
export async function updateTokens(update: TokenUpdate): Promise<void> {
  const current = await readTokens();
  if (!current) {
    throw new Error("No tokens to update");
  }
  const next: StoredTokens = {
    ...current,
    ...update,
  };
  if (update.expires_in !== undefined) {
    next.expires_at = Date.now() + update.expires_in * 1000;
  }
  await writeFile(FILE_PATH, JSON.stringify(next, null, 0), "utf8");
}

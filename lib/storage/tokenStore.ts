import { readFile, writeFile, mkdir } from "node:fs/promises";

import type { StoredTokens } from "@/types/auth";
import { getDataDir, getTokensFilePath } from "@/constants/storage";

type TokenUpdate = Partial<Omit<StoredTokens, "expires_at">> & {
  expires_at?: number;
  expires_in?: number; // seconds from API
};

const ensureDataDir = async (): Promise<void> => {
  await mkdir(getDataDir(), { recursive: true });
};

const readTokens = async (): Promise<StoredTokens | null> => {
  try {
    const raw = await readFile(getTokensFilePath(), "utf8");
    return JSON.parse(raw) as StoredTokens;
  } catch {
    return null;
  }
};

// Save tokens. expires_in is seconds from X API; we store expires_at in ms.
export const saveTokens = async (
  access_token: string,
  refresh_token: string,
  expires_in: number,
): Promise<void> => {
  await ensureDataDir();

  const expires_at = Date.now() + expires_in * 1000;
  const data: StoredTokens = {
    access_token,
    refresh_token,
    expires_at,
  };

  await writeFile(getTokensFilePath(), JSON.stringify(data, null, 0), "utf8");
};

// Get stored tokens (server-side only).
export const getTokens = async (): Promise<StoredTokens | null> => {
  return readTokens();
};

// Update stored tokens (e.g. after refresh).
export const updateTokens = async (update: TokenUpdate): Promise<void> => {
  const current = await readTokens();
  if (!current) throw new Error("No tokens to update");

  const next: StoredTokens = {
    ...current,
    ...update,
  };

  if (update.expires_in !== undefined)
    next.expires_at = Date.now() + update.expires_in * 1000;

  await writeFile(getTokensFilePath(), JSON.stringify(next, null, 0), "utf8");
};

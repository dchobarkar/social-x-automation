/**
 * Local storage paths (data dir and file paths).
 * Used by lib/tokenStore, lib/pkceStateStore, lib/feedStore, lib/searchStore.
 */

import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_X_DIR = path.join(DATA_DIR, "x");

export const TOKENS_FILE_PATH = path.join(DATA_DIR, "tokens.json");
export const PKCE_STATE_FILE_PATH = path.join(DATA_DIR, "pkce-state.json");
export const FEED_FILE_PATH = path.join(DATA_X_DIR, "feed.json");
export const SEARCH_FILE_PATH = path.join(DATA_X_DIR, "search.json");

export const getDataDir = (): string => DATA_DIR;
export const getDataXDir = (): string => DATA_X_DIR;

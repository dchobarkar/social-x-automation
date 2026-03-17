/**
 * Local storage paths (data dir and file paths).
 * Resolved at call time so process.cwd() is correct in Next.js API routes.
 */

import path from "node:path";

export const getDataDir = (): string => path.join(process.cwd(), "data");
export const getDataXDir = (): string => path.join(getDataDir(), "x");

export const getTokensFilePath = (): string =>
  path.join(getDataDir(), "tokens.json");
export const getPkceStateFilePath = (): string =>
  path.join(getDataDir(), "pkce-state.json");
export const getFeedFilePath = (): string =>
  path.join(getDataXDir(), "feed.json");
export const getSearchFilePath = (): string =>
  path.join(getDataXDir(), "search.json");

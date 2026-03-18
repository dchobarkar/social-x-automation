/**
 * Local storage paths (data dir and file paths).
 * Resolved at call time so process.cwd() is correct in Next.js API routes.
 */

import path from "node:path";

export const getDataDir = (): string => path.join(process.cwd(), "data");
export const getDataXDir = (): string => path.join(getDataDir(), "x");

// Auth storage is platform-scoped for future integrations.
export const getAuthDir = (): string => path.join(getDataDir(), "auth");
export const getAuthXDir = (): string => path.join(getAuthDir(), "x");
export const getAuthLinkedInDir = (): string =>
  path.join(getAuthDir(), "linkedin");
export const getAuthRedditDir = (): string => path.join(getAuthDir(), "reddit");

export const getTokensFilePath = (): string =>
  path.join(getAuthXDir(), "tokens.json");
export const getPkceStateFilePath = (): string =>
  path.join(getAuthXDir(), "pkce-state.json");

export const getFeedFilePath = (): string =>
  path.join(getDataXDir(), "feed.json");

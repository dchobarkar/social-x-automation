/**
 * Stored OAuth tokens (access, refresh, expiry).
 * Used by X today; Reddit and LinkedIn can use the same shape or extend per platform.
 */
export type StoredTokens = {
  access_token: string;
  refresh_token: string;
  expires_at: number; // Unix ms
};

// Auth-related constants: PKCE and OAuth state.
export const PKCE_CODE_VERIFIER_LENGTH = 32;

export const PKCE_STATE_LENGTH = 24;

/** PKCE state TTL in ms (10 minutes). */
export const PKCE_STATE_TTL_MS = 10 * 60 * 1000;

import { createHash, randomBytes } from "node:crypto";

import { PKCE_CODE_VERIFIER_LENGTH, PKCE_STATE_LENGTH } from "@/constants/auth";

// Generate a cryptographically random code_verifier (43–128 chars).
export const generateCodeVerifier = (): string => {
  const bytes = randomBytes(PKCE_CODE_VERIFIER_LENGTH);
  return base64UrlEncode(bytes);
};

// code_challenge = BASE64URL(SHA256(code_verifier))
export const generateCodeChallenge = (verifier: string): string => {
  const hash = createHash("sha256").update(verifier, "utf8").digest();
  return base64UrlEncode(hash);
};

// Generate a random state string for CSRF protection.
export const generateState = (): string => {
  const bytes = randomBytes(PKCE_STATE_LENGTH);
  return base64UrlEncode(bytes);
};

const base64UrlEncode = (buffer: Buffer): string => {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

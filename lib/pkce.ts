import { createHash, randomBytes } from "node:crypto";

const PKCE_LENGTH = 32;
const STATE_LENGTH = 24;

// Generate a cryptographically random code_verifier (43–128 chars).
export const generateCodeVerifier = (): string => {
  const bytes = randomBytes(PKCE_LENGTH);
  return base64UrlEncode(bytes);
};

// code_challenge = BASE64URL(SHA256(code_verifier))
export const generateCodeChallenge = (verifier: string): string => {
  const hash = createHash("sha256").update(verifier, "utf8").digest();
  return base64UrlEncode(hash);
};

// Generate a random state string for CSRF protection.
export const generateState = (): string => {
  const bytes = randomBytes(STATE_LENGTH);
  return base64UrlEncode(bytes);
};

const base64UrlEncode = (buffer: Buffer): string => {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

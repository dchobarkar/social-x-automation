import { createHash, randomBytes } from "node:crypto";

import { PKCE_CODE_VERIFIER_LENGTH, PKCE_STATE_LENGTH } from "@/constants/auth";

export const generateCodeVerifier = (): string => {
  const bytes = randomBytes(PKCE_CODE_VERIFIER_LENGTH);
  return base64UrlEncode(bytes);
};

export const generateCodeChallenge = (verifier: string): string => {
  const hash = createHash("sha256").update(verifier, "utf8").digest();
  return base64UrlEncode(hash);
};

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

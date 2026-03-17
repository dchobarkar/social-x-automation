import { readFile, writeFile, mkdir } from "node:fs/promises";

import { PKCE_STATE_TTL_MS } from "@/constants/auth";
import { getDataDir, getPkceStateFilePath } from "@/constants/storage";

type PkceEntry = { code_verifier: string; createdAt: number };
type PkceStateFile = Record<string, PkceEntry>;

const ensureDataDir = async (): Promise<void> => {
  await mkdir(getDataDir(), { recursive: true });
};

const readState = async (): Promise<PkceStateFile> => {
  try {
    const raw = await readFile(getPkceStateFilePath(), "utf8");
    const data = JSON.parse(raw) as PkceStateFile;
    return data;
  } catch {
    return {};
  }
};

const writeState = async (data: PkceStateFile): Promise<void> => {
  await ensureDataDir();
  await writeFile(
    getPkceStateFilePath(),
    JSON.stringify(data, null, 0),
    "utf8",
  );
};

/**
 * Store state and code_verifier for validation in callback.
 */
export const savePkceState = async (
  state: string,
  code_verifier: string,
): Promise<void> => {
  const data = await readState();
  data[state] = { code_verifier, createdAt: Date.now() };
  await writeState(data);
};

/**
 * Get code_verifier for state and remove the entry (one-time use).
 */
export const consumePkceState = async (
  state: string,
): Promise<string | null> => {
  const data = await readState();
  const entry = data[state];
  if (!entry) return null;

  if (Date.now() - entry.createdAt > PKCE_STATE_TTL_MS) {
    delete data[state];
    await writeState(data);
    return null;
  }
  delete data[state];
  await writeState(data);
  return entry.code_verifier;
};

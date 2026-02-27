import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE_PATH = path.join(DATA_DIR, "pkce-state.json");

type PkceEntry = { code_verifier: string; createdAt: number };
type PkceStateFile = Record<string, PkceEntry>;

const TTL_MS = 10 * 60 * 1000; // 10 minutes

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readState(): Promise<PkceStateFile> {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    const data = JSON.parse(raw) as PkceStateFile;
    return data;
  } catch {
    return {};
  }
}

async function writeState(data: PkceStateFile): Promise<void> {
  await ensureDataDir();
  await writeFile(FILE_PATH, JSON.stringify(data, null, 0), "utf8");
}

/**
 * Store state and code_verifier for validation in callback.
 */
export async function savePkceState(
  state: string,
  code_verifier: string,
): Promise<void> {
  const data = await readState();
  data[state] = { code_verifier, createdAt: Date.now() };
  await writeState(data);
}

/**
 * Get code_verifier for state and remove the entry (one-time use).
 */
export async function consumePkceState(state: string): Promise<string | null> {
  const data = await readState();
  const entry = data[state];
  if (!entry) return null;
  if (Date.now() - entry.createdAt > TTL_MS) {
    delete data[state];
    await writeState(data);
    return null;
  }
  delete data[state];
  await writeState(data);
  return entry.code_verifier;
}

import { NextResponse } from "next/server";

import { clearTokens } from "@/lib/storage/tokenStore";
import { clearPkceStateFile } from "@/lib/storage/pkceStateStore";

export const POST = async () => {
  try {
    await Promise.all([clearTokens(), clearPkceStateFile()]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
};

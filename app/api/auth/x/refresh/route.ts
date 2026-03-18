import { NextResponse } from "next/server";

import { refreshXTokens } from "@/services/x/auth.service";

export async function POST() {
  try {
    await refreshXTokens();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refresh failed";
    const status =
      typeof message === "string" &&
      message.toLowerCase().includes("no refresh token")
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

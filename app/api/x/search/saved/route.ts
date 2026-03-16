import { NextRequest, NextResponse } from "next/server";

import { getSavedSearch, saveSearch } from "@/lib/searchStore";
import type { StoredTweet } from "@/types/tweet";

export const GET = async () => {
  try {
    const items = await getSavedSearch();
    return NextResponse.json({ items });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load saved search";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    const items = body.items;
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items must be an array" },
        { status: 400 },
      );
    }
    const valid = items.filter(
      (t: unknown): t is StoredTweet =>
        t != null &&
        typeof t === "object" &&
        typeof (t as StoredTweet).id === "string" &&
        typeof (t as StoredTweet).text === "string",
    );
    await saveSearch(valid);
    return NextResponse.json({ ok: true, count: valid.length });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save search";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

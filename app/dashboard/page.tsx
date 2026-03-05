"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Message = { type: "success" | "error"; text: string };
type VariantChoice = "humorous" | "insightful";
type TweetMetrics = {
  reply_count?: number;
  like_count?: number;
  retweet_count?: number;
  quote_count?: number;
};
type TweetWithReplies = {
  id: string;
  text: string;
  /** When set, reply UI and post are shown */
  humorous?: string;
  insightful?: string;
  selected: VariantChoice;
  /** Feed-only display (no OpenAI yet) */
  author_username?: string;
  author_name?: string;
  created_at?: string;
  public_metrics?: TweetMetrics;
  author_followers_count?: number;
};

const Page = () => {
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(5);
  const [items, setItems] = useState<TweetWithReplies[]>([]);
  const [message, setMessage] = useState<Message | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [postingForId, setPostingForId] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [feedLastHours, setFeedLastHours] = useState<number | "">("");
  const [feedMaxResults, setFeedMaxResults] = useState(20);
  const [feedExcludeReplies, setFeedExcludeReplies] = useState(false);
  const [feedExcludeRetweets, setFeedExcludeRetweets] = useState(false);
  const [feedMaxReplyCount, setFeedMaxReplyCount] = useState<string>("");
  const [feedMinAuthorFollowers, setFeedMinAuthorFollowers] =
    useState<string>("");
  const [accessExpiresAt, setAccessExpiresAt] = useState<number | null>(null);

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
  }, []);

  const fetchAuthStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/x/status");
      const data = await res.json();
      setConnected(data.connected === true);
      setAccessExpiresAt(
        typeof data.accessExpiresAt === "number" ? data.accessExpiresAt : null,
      );
    } catch {
      setConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchAuthStatus();
  }, [fetchAuthStatus]);

  useEffect(() => {
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const error = params.get("error");
    const success = params.get("success");
    if (error) {
      showMessage("error", decodeURIComponent(error));
      window.history.replaceState({}, "", "/dashboard");
    } else if (success) {
      showMessage("success", "X account connected successfully.");
      window.history.replaceState({}, "", "/dashboard");
      fetchAuthStatus();
    }
  }, [showMessage, fetchAuthStatus]);

  const handleConnectX = () => {
    window.location.href = "/api/auth/x/oauth";
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      showMessage("error", "Enter at least one keyword to search.");
      return;
    }
    setLoadingSearch(true);
    setMessage(null);
    try {
      const res = await fetch("/api/twitter/search-with-replies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), maxResults }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");

      const mapped: TweetWithReplies[] = (data.items ?? []).map(
        (item: {
          tweet: { id: string; text: string };
          humorous: string;
          insightful: string;
        }) => ({
          id: item.tweet.id,
          text: item.tweet.text,
          humorous: item.humorous,
          insightful: item.insightful,
          selected: "humorous",
        }),
      );
      setItems(mapped);
      if (!mapped.length)
        showMessage("success", "No tweets found for that query.");
      else
        showMessage(
          "success",
          `Found ${mapped.length} tweet(s) and generated replies.`,
        );
    } catch (e) {
      showMessage(
        "error",
        e instanceof Error ? e.message : "Failed to search and generate",
      );
    } finally {
      setLoadingSearch(false);
    }
  };

  /** Load feed only (no OpenAI). Data is shown on the page; reply generation later. */
  const handleLoadFeedOnly = async () => {
    setLoadingFeed(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = {
        maxResults: Math.min(Math.max(feedMaxResults, 1), 100),
        excludeReplies: feedExcludeReplies,
        excludeRetweets: feedExcludeRetweets,
      };
      if (feedLastHours !== "") {
        const h = Number(feedLastHours);
        if (Number.isFinite(h) && h > 0) body.lastHours = h;
      }
      if (feedMaxReplyCount.trim() !== "") {
        const n = Number.parseInt(feedMaxReplyCount, 10);
        if (Number.isFinite(n) && n >= 0) body.maxReplyCount = n;
      }
      if (feedMinAuthorFollowers.trim() !== "") {
        const n = Number.parseInt(feedMinAuthorFollowers, 10);
        if (Number.isFinite(n) && n >= 0) body.minAuthorFollowers = n;
      }
      const res = await fetch("/api/twitter/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Load feed failed");

      const raw = (data.items ?? []) as Array<{
        id: string;
        text: string;
        author_username?: string;
        author_name?: string;
        created_at?: string;
        public_metrics?: TweetMetrics;
        author_metrics?: { followers_count?: number };
      }>;
      const mapped: TweetWithReplies[] = raw.map((item) => ({
        id: item.id,
        text: item.text,
        selected: "humorous" as VariantChoice,
        author_username: item.author_username,
        author_name: item.author_name,
        created_at: item.created_at,
        public_metrics: item.public_metrics,
        author_followers_count: item.author_metrics?.followers_count,
      }));
      setItems(mapped);
      if (!mapped.length)
        showMessage("success", "No tweets in your feed for these filters.");
      else
        showMessage(
          "success",
          `Loaded ${mapped.length} tweet(s) from your home feed.`,
        );
    } catch (e) {
      showMessage(
        "error",
        e instanceof Error ? e.message : "Failed to load feed",
      );
    } finally {
      setLoadingFeed(false);
    }
  };

  const handleChangeSelection = (id: string, choice: VariantChoice) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: choice } : item,
      ),
    );
  };

  const handlePostFor = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const chosenText =
      item.selected === "humorous" ? item.humorous : item.insightful;
    if (!chosenText || !chosenText.trim()) {
      showMessage("error", "Selected reply is empty.");
      return;
    }

    setPostingForId(id);
    setMessage(null);
    try {
      const res = await fetch("/api/twitter/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweetId: id, text: chosenText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Post failed");

      showMessage("success", "Reply posted successfully.");
    } catch (e) {
      showMessage(
        "error",
        e instanceof Error ? e.message : "Failed to post reply",
      );
    } finally {
      setPostingForId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight">
            X AI Reply Automation
          </h1>

          <Link
            href="/"
            className="text-sm text-(--foreground)/70 hover:underline"
          >
            ← Home
          </Link>
        </header>

        <section className="rounded-xl border border-(--foreground)/10 bg-background p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-2">1. Connect X Account</h2>

          {connected === null ? (
            <p className="text-sm text-(--foreground)/70">Checking…</p>
          ) : connected ? (
            <div className="space-y-2">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                Connected to X
              </p>
              <p className="text-xs text-(--foreground)/70">
                Access tokens are refreshed automatically. You can search and
                post replies.
              </p>
              {accessExpiresAt != null && (
                <p className="text-xs text-(--foreground)/60">
                  Next refresh before:{" "}
                  {new Date(accessExpiresAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-(--foreground)/70 mb-4">
                Sign in with X (OAuth 2.0) to post replies on your behalf.
              </p>
              <button
                type="button"
                onClick={handleConnectX}
                className="px-4 py-2 rounded-lg bg-[#0f1419] text-white hover:bg-[#1a1f24] transition-colors font-medium"
              >
                Connect X Account
              </button>
            </>
          )}
        </section>

        <section className="rounded-xl border border-(--foreground)/10 bg-background p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-medium">2. Get tweets to reply to</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Search by keyword</h3>
              <div className="flex flex-wrap gap-2 items-end">
                <div className="min-w-50">
                  <label
                    htmlFor="query"
                    className="block text-xs text-(--foreground)/70 mb-0.5"
                  >
                    Query
                  </label>
                  <input
                    id="query"
                    type="text"
                    placeholder="e.g. nextjs OR react lang:en"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30 text-sm"
                  />
                </div>
                <div className="w-20">
                  <label
                    htmlFor="maxResults"
                    className="block text-xs text-(--foreground)/70 mb-0.5"
                  >
                    Max (1–20)
                  </label>
                  <input
                    id="maxResults"
                    type="number"
                    min={1}
                    max={20}
                    value={maxResults}
                    onChange={(e) =>
                      setMaxResults(
                        Number.isNaN(Number(e.target.value))
                          ? 5
                          : Math.min(
                              20,
                              Math.max(1, Number.parseInt(e.target.value, 10)),
                            ),
                      )
                    }
                    className="w-full px-2 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loadingSearch}
                  className="px-4 py-2 rounded-lg bg-[#0f1419] text-white hover:bg-[#1a1f24] disabled:opacity-60 transition-colors font-medium text-sm"
                >
                  {loadingSearch ? "Searching…" : "Search & generate"}
                </button>
              </div>
            </div>

            <div className="border-t border-(--foreground)/10 pt-4">
              <h3 className="text-sm font-medium mb-2">Or load my home feed</h3>
              <p className="text-xs text-(--foreground)/70 mb-3">
                Same tweets you see on your X home/feed (no OpenAI). Optional
                filters below. Reply generation can be added later.
              </p>
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label
                    htmlFor="feedLastHours"
                    className="block text-xs text-(--foreground)/70 mb-0.5"
                  >
                    Posted in last
                  </label>
                  <select
                    id="feedLastHours"
                    value={feedLastHours === "" ? "" : String(feedLastHours)}
                    onChange={(e) =>
                      setFeedLastHours(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="px-3 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30 text-sm"
                  >
                    <option value="">All time</option>
                    <option value="1">1 hour</option>
                    <option value="6">6 hours</option>
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                  </select>
                </div>
                <div className="w-20">
                  <label
                    htmlFor="feedMaxResults"
                    className="block text-xs text-(--foreground)/70 mb-0.5"
                  >
                    Max (1–100)
                  </label>
                  <input
                    id="feedMaxResults"
                    type="number"
                    min={1}
                    max={100}
                    value={feedMaxResults}
                    onChange={(e) =>
                      setFeedMaxResults(
                        Math.min(
                          100,
                          Math.max(
                            1,
                            Number.parseInt(e.target.value, 10) || 20,
                          ),
                        ),
                      )
                    }
                    className="w-full px-2 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="feedExcludeReplies"
                    type="checkbox"
                    checked={feedExcludeReplies}
                    onChange={(e) => setFeedExcludeReplies(e.target.checked)}
                  />
                  <label htmlFor="feedExcludeReplies" className="text-sm">
                    Exclude replies
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="feedExcludeRetweets"
                    type="checkbox"
                    checked={feedExcludeRetweets}
                    onChange={(e) => setFeedExcludeRetweets(e.target.checked)}
                  />
                  <label htmlFor="feedExcludeRetweets" className="text-sm">
                    Exclude retweets
                  </label>
                </div>
                <div className="w-24">
                  <label
                    htmlFor="feedMaxReplyCount"
                    className="block text-xs text-(--foreground)/70 mb-0.5"
                  >
                    Max replies
                  </label>
                  <input
                    id="feedMaxReplyCount"
                    type="text"
                    placeholder="e.g. 20"
                    value={feedMaxReplyCount}
                    onChange={(e) => setFeedMaxReplyCount(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30 text-sm"
                  />
                </div>
                <div className="w-28">
                  <label
                    htmlFor="feedMinAuthorFollowers"
                    className="block text-xs text-(--foreground)/70 mb-0.5"
                  >
                    Min author followers
                  </label>
                  <input
                    id="feedMinAuthorFollowers"
                    type="text"
                    placeholder="e.g. 100"
                    value={feedMinAuthorFollowers}
                    onChange={(e) => setFeedMinAuthorFollowers(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLoadFeedOnly}
                  disabled={loadingFeed}
                  className="px-4 py-2 rounded-lg bg-[#0f1419] text-white hover:bg-[#1a1f24] disabled:opacity-60 transition-colors font-medium text-sm"
                >
                  {loadingFeed ? "Loading feed…" : "Load feed"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {items.length > 0 && (
          <section className="rounded-xl border border-(--foreground)/10 bg-background p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-medium">3. Tweets</h2>
            <p className="text-sm text-(--foreground)/70">
              Feed-only items show tweet data; reply generation can be added
              later. Search results include AI reply variants you can post.
            </p>
            <div className="space-y-6">
              {items.map((item) => {
                const hasReplies =
                  (item.humorous ?? "").trim() !== "" ||
                  (item.insightful ?? "").trim() !== "";
                return (
                  <article
                    key={item.id}
                    className="rounded-lg border border-(--foreground)/10 bg-background p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-(--foreground)/70">
                      <span>ID: {item.id}</span>
                      {item.author_username != null && (
                        <span>
                          @{item.author_username}
                          {item.author_name != null && ` (${item.author_name})`}
                        </span>
                      )}
                      {item.author_followers_count != null && (
                        <span>
                          {item.author_followers_count.toLocaleString()}{" "}
                          followers
                        </span>
                      )}
                      {item.created_at != null && (
                        <span>
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {item.public_metrics != null && (
                      <div className="flex gap-4 text-xs text-(--foreground)/60">
                        {item.public_metrics.reply_count != null && (
                          <span>{item.public_metrics.reply_count} replies</span>
                        )}
                        {item.public_metrics.like_count != null && (
                          <span>{item.public_metrics.like_count} likes</span>
                        )}
                        {item.public_metrics.retweet_count != null && (
                          <span>
                            {item.public_metrics.retweet_count} retweets
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{item.text}</p>

                    {hasReplies ? (
                      <>
                        <div className="flex flex-col gap-3 mt-2">
                          <div className="flex items-center gap-2">
                            <input
                              id={`humorous-${item.id}`}
                              type="radio"
                              name={`choice-${item.id}`}
                              checked={item.selected === "humorous"}
                              onChange={() =>
                                handleChangeSelection(item.id, "humorous")
                              }
                            />
                            <label
                              htmlFor={`humorous-${item.id}`}
                              className="text-sm font-medium"
                            >
                              Humorous
                            </label>
                          </div>
                          <textarea
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30 resize-y text-sm"
                            value={item.humorous ?? ""}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((it) =>
                                  it.id === item.id
                                    ? { ...it, humorous: e.target.value }
                                    : it,
                                ),
                              )
                            }
                          />

                          <div className="flex items-center gap-2">
                            <input
                              id={`insightful-${item.id}`}
                              type="radio"
                              name={`choice-${item.id}`}
                              checked={item.selected === "insightful"}
                              onChange={() =>
                                handleChangeSelection(item.id, "insightful")
                              }
                            />
                            <label
                              htmlFor={`insightful-${item.id}`}
                              className="text-sm font-medium"
                            >
                              Insightful
                            </label>
                          </div>
                          <textarea
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30 resize-y text-sm"
                            value={item.insightful ?? ""}
                            onChange={(e) =>
                              setItems((prev) =>
                                prev.map((it) =>
                                  it.id === item.id
                                    ? { ...it, insightful: e.target.value }
                                    : it,
                                ),
                              )
                            }
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handlePostFor(item.id)}
                            disabled={postingForId === item.id}
                            className="px-4 py-2 rounded-lg bg-[#0f1419] text-white hover:bg-[#1a1f24] disabled:opacity-60 transition-colors font-medium text-sm"
                          >
                            {postingForId === item.id
                              ? "Posting…"
                              : "Post selected reply"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-(--foreground)/60 italic">
                        Reply generation coming later.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {message && (
          <div
            role="alert"
            className={`rounded-lg p-4 ${
              message.type === "success"
                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                : "bg-red-500/10 text-red-700 dark:text-red-400"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;

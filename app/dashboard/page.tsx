"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Message = { type: "success" | "error"; text: string };

type VariantChoice = "humorous" | "insightful";

type TweetWithReplies = {
  id: string;
  text: string;
  humorous: string;
  insightful: string;
  selected: VariantChoice;
};

const Page = () => {
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(5);
  const [items, setItems] = useState<TweetWithReplies[]>([]);
  const [message, setMessage] = useState<Message | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [postingForId, setPostingForId] = useState<string | null>(null);

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
  }, []);

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
    }
  }, [showMessage]);

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
      if (!res.ok) {
        throw new Error(data.error ?? "Search failed");
      }
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
      if (!mapped.length) {
        showMessage("success", "No tweets found for that query.");
      } else {
        showMessage(
          "success",
          `Found ${mapped.length} tweet(s) and generated replies.`,
        );
      }
    } catch (e) {
      showMessage(
        "error",
        e instanceof Error ? e.message : "Failed to search and generate",
      );
    } finally {
      setLoadingSearch(false);
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
    if (!chosenText.trim()) {
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
      if (!res.ok) {
        throw new Error(data.error ?? "Post failed");
      }
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
        </section>

        <section className="rounded-xl border border-(--foreground)/10 bg-background p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-medium">2. Search posts by keyword</h2>
          <div>
            <label htmlFor="query" className="block text-sm font-medium mb-1">
              Keywords or search query
            </label>
            <input
              id="query"
              type="text"
              placeholder="e.g. nextjs OR react lang:en"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30"
            />
          </div>
          <div>
            <label
              htmlFor="maxResults"
              className="block text-sm font-medium mb-1"
            >
              Max results (1–20)
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
              className="w-24 px-3 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={loadingSearch}
            className="px-4 py-2 rounded-lg bg-[#0f1419] text-white hover:bg-[#1a1f24] disabled:opacity-60 transition-colors font-medium"
          >
            {loadingSearch ? "Searching & generating…" : "Search & generate"}
          </button>
        </section>

        {items.length > 0 && (
          <section className="rounded-xl border border-(--foreground)/10 bg-background p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-medium">3. Review & post replies</h2>
            <p className="text-sm text-(--foreground)/70">
              For each tweet, choose either the humorous or insightful reply,
              tweak the text if needed, then post.
            </p>
            <div className="space-y-6">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-(--foreground)/10 bg-background p-4 space-y-3"
                >
                  <div className="text-xs text-(--foreground)/70">
                    Tweet ID: {item.id}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{item.text}</p>

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
                      value={item.humorous}
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
                      value={item.insightful}
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
                </article>
              ))}
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

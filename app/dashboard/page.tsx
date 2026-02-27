"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Message = { type: "success" | "error"; text: string };

const Page = () => {
  const [tweetId, setTweetId] = useState("");
  const [tweetText, setTweetText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<"generate" | "reply" | null>(null);

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

  const handleGenerateReply = async () => {
    if (!tweetText.trim()) {
      showMessage("error", "Enter tweet text to generate a reply.");
      return;
    }
    setLoading("generate");
    setMessage(null);
    try {
      const res = await fetch("/api/twitter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweetText: tweetText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Generate failed");
      }
      setReplyText(data.reply ?? "");
      showMessage("success", "Reply generated.");
    } catch (e) {
      showMessage(
        "error",
        e instanceof Error ? e.message : "Failed to generate reply",
      );
    } finally {
      setLoading(null);
    }
  };

  const handlePostReply = async () => {
    if (!tweetId.trim()) {
      showMessage("error", "Enter a tweet ID.");
      return;
    }
    if (!replyText.trim()) {
      showMessage("error", "Generate or enter reply text first.");
      return;
    }
    setLoading("reply");
    setMessage(null);
    try {
      const res = await fetch("/api/twitter/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweetId: tweetId.trim(),
          text: replyText.trim(),
        }),
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
      setLoading(null);
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
          <h2 className="text-lg font-medium">2. Tweet ID &amp; Text</h2>
          <div>
            <label htmlFor="tweetId" className="block text-sm font-medium mb-1">
              Tweet ID
            </label>
            <input
              id="tweetId"
              type="text"
              placeholder="e.g. 1234567890123456789"
              value={tweetId}
              onChange={(e) => setTweetId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30"
            />
          </div>
          <div>
            <label
              htmlFor="tweetText"
              className="block text-sm font-medium mb-1"
            >
              Tweet Text
            </label>
            <textarea
              id="tweetText"
              rows={3}
              placeholder="Paste the tweet content to generate a reply…"
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30 resize-y"
            />
          </div>
        </section>

        <section className="rounded-xl border border-(--foreground)/10 bg-background p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-medium">3. Generate Reply</h2>
          <button
            type="button"
            onClick={handleGenerateReply}
            disabled={loading !== null}
            className="px-4 py-2 rounded-lg bg-[#0f1419] text-white hover:bg-[#1a1f24] disabled:opacity-60 transition-colors font-medium"
          >
            {loading === "generate" ? "Generating…" : "Generate Reply"}
          </button>
          <div>
            <label
              htmlFor="replyText"
              className="block text-sm font-medium mb-1"
            >
              Reply text (editable)
            </label>
            <textarea
              id="replyText"
              rows={4}
              placeholder="Generated reply or type your own…"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-(--foreground)/20 bg-background focus:outline-none focus:ring-2 focus:ring-(--foreground)/30 resize-y"
            />
          </div>
        </section>

        <section className="rounded-xl border border-(--foreground)/10 bg-background p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-2">4. Post Reply</h2>
          <p className="text-sm text-(--foreground)/70 mb-4">
            Post the reply to the tweet (Tweet ID must match the tweet you want
            to reply to).
          </p>
          <button
            type="button"
            onClick={handlePostReply}
            disabled={loading !== null}
            className="px-4 py-2 rounded-lg bg-[#0f1419] text-white hover:bg-[#1a1f24] disabled:opacity-60 transition-colors font-medium"
          >
            {loading === "reply" ? "Posting…" : "Post Reply"}
          </button>
        </section>

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

"use client";

import { useCallback, useEffect, useState } from "react";
import { Reply, Trash2, ExternalLink } from "lucide-react";

import type { StoredTweet, VariantChoice } from "@/types/tweet";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import Input from "@/components/form/Input";
import Checkbox from "@/components/form/Checkbox";
import Textarea from "@/components/form/Textarea";
import {
  FEED_DEFAULT_MAX_RESULTS,
  FEED_LAST_HOURS_OPTIONS,
} from "@/constants/defaults";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/utils/cn";

type Message = { type: "success" | "error"; text: string };

const formatRelativeTime = (created_at: string | undefined): string | null => {
  if (created_at == null) return null;

  const d = new Date(created_at);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffM < 1) return "now";
  if (diffM < 60) return `${diffM}m`;
  if (diffH < 24) return `${diffH}h`;
  if (diffD < 7) return `${diffD}d`;
  return d.toLocaleDateString();
};

const FeedPage = () => {
  const [items, setItems] = useState<StoredTweet[]>([]);
  const [message, setMessage] = useState<Message | null>(null);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [loadingReplyForId, setLoadingReplyForId] = useState<string | null>(
    null,
  );
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [postingForId, setPostingForId] = useState<string | null>(null);
  const [feedLastHours, setFeedLastHours] = useState<number | "">("");
  const [feedMaxResults, setFeedMaxResults] = useState(
    FEED_DEFAULT_MAX_RESULTS,
  );
  const [feedExcludeReplies, setFeedExcludeReplies] = useState(false);
  const [feedExcludeRetweets, setFeedExcludeRetweets] = useState(false);
  const [feedMaxReplyCount, setFeedMaxReplyCount] = useState("");
  const [feedMinAuthorFollowers, setFeedMinAuthorFollowers] = useState("");

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(ROUTES.API_X_FEED_SAVED)
      .then((res) => res.json())
      .then((data: { items?: StoredTweet[] }) => {
        if (cancelled || !Array.isArray(data.items)) return;
        if (data.items.length > 0) setItems(data.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadFeed = async () => {
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
      const res = await fetch(ROUTES.API_X_FEED, {
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
        author_profile_image_url?: string;
        created_at?: string;
        public_metrics?: StoredTweet["public_metrics"];
        author_metrics?: { followers_count?: number };
      }>;
      const mapped: StoredTweet[] = raw.map((item) => ({
        id: item.id,
        text: item.text,
        selected: "humorous",
        author_username: item.author_username,
        author_name: item.author_name,
        author_profile_image_url: item.author_profile_image_url,
        created_at: item.created_at,
        public_metrics: item.public_metrics,
        author_followers_count: item.author_metrics?.followers_count,
      }));
      setItems(mapped);
      await fetch(ROUTES.API_X_FEED_SAVED, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: mapped }),
      }).catch(() => {});
      if (mapped.length === 0) {
        showMessage("success", "No tweets in your feed for these filters.");
      } else {
        showMessage(
          "success",
          `Loaded ${mapped.length} tweet(s) from your home feed.`,
        );
      }
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

  const handleDeleteTweet = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      fetch(ROUTES.API_X_FEED_SAVED, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: next }),
      }).catch(() => {});
      return next;
    });
    setReplyingToId((curr) => (curr === id ? null : curr));
  }, []);

  const handleReplyClick = useCallback(
    async (item: StoredTweet) => {
      const isOpen = replyingToId === item.id;
      if (isOpen) {
        setReplyingToId(null);
        return;
      }
      setReplyingToId(item.id);
      const hasVariants =
        (item.humorous ?? "").trim() !== "" ||
        (item.insightful ?? "").trim() !== "";
      if (hasVariants) return;
      setLoadingReplyForId(item.id);
      setMessage(null);
      try {
        const res = await fetch(ROUTES.API_X_GENERATE_VARIANTS, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tweetText: item.text }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg =
            typeof data?.error === "string" ? data.error : "Generate failed";
          throw new Error(msg);
        }
        const updated = items.map((it) =>
          it.id === item.id
            ? {
                ...it,
                humorous: data.humorous ?? "",
                insightful: data.insightful ?? "",
                selected: "humorous" as VariantChoice,
              }
            : it,
        );
        setItems(updated);
        await fetch(ROUTES.API_X_FEED_SAVED, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: updated }),
        }).catch(() => {});
      } catch (e) {
        showMessage(
          "error",
          e instanceof Error ? e.message : "Failed to generate reply options",
        );
      } finally {
        setLoadingReplyForId(null);
      }
    },
    [replyingToId, items, showMessage],
  );

  const handlePostFor = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const chosenText =
      item.selected === "humorous" ? item.humorous : item.insightful;
    if (!chosenText?.trim()) {
      showMessage("error", "Selected reply is empty.");
      return;
    }
    setPostingForId(id);
    setMessage(null);
    try {
      const res = await fetch(ROUTES.API_X_REPLY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweetId: id, text: chosenText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Post failed");
      showMessage("success", "Reply posted successfully.");
      setReplyingToId(null);
      const next = items.filter((i) => i.id !== id);
      setItems(next);
      await fetch(ROUTES.API_X_FEED_SAVED, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: next }),
      }).catch(() => {});
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
    <SectionLayout padding="none" variant="transparent" as="div">
      <h1 className="text-h2 font-semibold tracking-tight mb-2">Home Feed</h1>
      <p className="text-muted mb-6">
        Load your X home timeline. Tweets are stored in data/x/feed.json. Click
        Reply to generate options with OpenAI.
      </p>

      <Card title="Load feed" className="mb-8">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs text-muted mb-1">
                Posted in last
              </label>
              <select
                value={feedLastHours === "" ? "" : String(feedLastHours)}
                onChange={(e) =>
                  setFeedLastHours(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="w-full rounded-input border border-border bg-background px-3 py-2 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All time</option>
                {FEED_LAST_HOURS_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h} hour{h !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Max (1–100)"
              type="number"
              min={1}
              max={100}
              value={String(feedMaxResults)}
              onChange={(e) =>
                setFeedMaxResults(
                  Math.min(
                    100,
                    Math.max(
                      1,
                      Number.parseInt(e.target.value, 10) ||
                        FEED_DEFAULT_MAX_RESULTS,
                    ),
                  ),
                )
              }
              name="feedMaxResults"
            />
            <Input
              label="Max reply count"
              placeholder="e.g. 20"
              value={feedMaxReplyCount}
              onChange={(e) => setFeedMaxReplyCount(e.target.value)}
              name="feedMaxReplyCount"
            />
            <Input
              label="Min author followers"
              placeholder="e.g. 100"
              value={feedMinAuthorFollowers}
              onChange={(e) => setFeedMinAuthorFollowers(e.target.value)}
              name="feedMinAuthorFollowers"
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Checkbox
              name="feedExcludeReplies"
              label="Exclude replies"
              checked={feedExcludeReplies}
              onChange={(e) => setFeedExcludeReplies(e.target.checked)}
            />
            <Checkbox
              name="feedExcludeRetweets"
              label="Exclude retweets"
              checked={feedExcludeRetweets}
              onChange={(e) => setFeedExcludeRetweets(e.target.checked)}
            />
            <Button onClick={handleLoadFeed} disabled={loadingFeed}>
              {loadingFeed ? "Loading feed…" : "Load feed"}
            </Button>
          </div>
        </div>
      </Card>

      {items.length > 0 && (
        <Card title="Tweets" className="mb-8">
          <p className="text-sm text-muted mb-4">
            Click Reply to generate Humorous &amp; Insightful options. Delete
            removes from list.
          </p>
          <div className="divide-y divide-border">
            {items.map((item) => {
              const displayName =
                item.author_name ?? item.author_username ?? "Unknown";
              const initial = displayName.charAt(0).toUpperCase();
              const timeStr = formatRelativeTime(item.created_at);
              return (
                <article
                  key={item.id}
                  className="py-4 px-1 -mx-1 rounded-card hover:bg-border/50 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="shrink-0">
                      {item.author_profile_image_url ? (
                        <img
                          src={item.author_profile_image_url}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover bg-border"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-full bg-border flex items-center justify-center text-lg font-semibold text-foreground"
                          aria-hidden
                        >
                          {initial}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 text-[15px]">
                        <span className="font-semibold text-foreground truncate">
                          {displayName}
                        </span>
                        {item.author_username != null && (
                          <span className="text-muted truncate">
                            @{item.author_username}
                          </span>
                        )}
                        {timeStr != null && (
                          <>
                            <span className="text-muted">·</span>
                            <span className="text-muted">{timeStr}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[13px] text-muted">
                        <span title="Tweet ID">ID: {item.id}</span>
                        {item.author_followers_count != null && (
                          <>
                            <span>·</span>
                            <span>
                              {item.author_followers_count >= 1000
                                ? `${(item.author_followers_count / 1000).toFixed(1)}K`
                                : item.author_followers_count.toLocaleString()}{" "}
                              followers
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-[15px] text-foreground whitespace-pre-wrap wrap-break-word mt-0.5 leading-snug">
                        {item.text}
                      </p>
                      {item.public_metrics != null &&
                        (item.public_metrics.reply_count != null ||
                          item.public_metrics.retweet_count != null ||
                          item.public_metrics.like_count != null) && (
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-muted text-[13px]">
                            {item.public_metrics.reply_count != null && (
                              <span>
                                {item.public_metrics.reply_count > 0
                                  ? `${item.public_metrics.reply_count} replies`
                                  : "Reply"}
                              </span>
                            )}
                            {item.public_metrics.retweet_count != null && (
                              <span>
                                {item.public_metrics.retweet_count > 0
                                  ? `${item.public_metrics.retweet_count} retweets`
                                  : "Retweet"}
                              </span>
                            )}
                            {item.public_metrics.like_count != null && (
                              <span>
                                {item.public_metrics.like_count > 0
                                  ? `${item.public_metrics.like_count} likes`
                                  : "Like"}
                              </span>
                            )}
                          </div>
                        )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          disabled={loadingReplyForId === item.id}
                          onClick={() => handleReplyClick(item)}
                          iconBefore={<Reply className="w-4 h-4 shrink-0" />}
                        >
                          Reply
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          onClick={() => handleDeleteTweet(item.id)}
                          className="text-error hover:bg-error/10"
                          iconBefore={<Trash2 className="w-4 h-4 shrink-0" />}
                        >
                          Delete
                        </Button>
                      </div>
                      {replyingToId === item.id && (
                        <div className="mt-4 pt-4 border-t border-border space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">
                              Reply options
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={() => setReplyingToId(null)}
                            >
                              Close
                            </Button>
                          </div>
                          {loadingReplyForId === item.id ? (
                            <p className="text-sm text-muted">
                              Generating reply options…
                            </p>
                          ) : (
                            <>
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    id={`humorous-${item.id}`}
                                    type="radio"
                                    name={`choice-${item.id}`}
                                    checked={item.selected === "humorous"}
                                    onChange={() =>
                                      handleChangeSelection(item.id, "humorous")
                                    }
                                    className="rounded-full border-border text-primary focus:ring-primary/30"
                                  />
                                  <label
                                    htmlFor={`humorous-${item.id}`}
                                    className="text-sm font-medium"
                                  >
                                    Humorous
                                  </label>
                                </div>
                                <Textarea
                                  rows={2}
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
                                  placeholder="Light, witty reply…"
                                  name={`humorous-${item.id}`}
                                />
                                <div className="flex items-center gap-2">
                                  <input
                                    id={`insightful-${item.id}`}
                                    type="radio"
                                    name={`choice-${item.id}`}
                                    checked={item.selected === "insightful"}
                                    onChange={() =>
                                      handleChangeSelection(
                                        item.id,
                                        "insightful",
                                      )
                                    }
                                    className="rounded-full border-border text-primary focus:ring-primary/30"
                                  />
                                  <label
                                    htmlFor={`insightful-${item.id}`}
                                    className="text-sm font-medium"
                                  >
                                    Insightful
                                  </label>
                                </div>
                                <Textarea
                                  rows={2}
                                  value={item.insightful ?? ""}
                                  onChange={(e) =>
                                    setItems((prev) =>
                                      prev.map((it) =>
                                        it.id === item.id
                                          ? {
                                              ...it,
                                              insightful: e.target.value,
                                            }
                                          : it,
                                      ),
                                    )
                                  }
                                  placeholder="Add perspective or value…"
                                  name={`insightful-${item.id}`}
                                />
                              </div>
                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <Button
                                  size="sm"
                                  type="button"
                                  onClick={() => handlePostFor(item.id)}
                                  disabled={
                                    postingForId === item.id ||
                                    !(
                                      (item.selected === "humorous" &&
                                        (item.humorous ?? "").trim()) ||
                                      (item.selected === "insightful" &&
                                        (item.insightful ?? "").trim())
                                    )
                                  }
                                >
                                  {postingForId === item.id
                                    ? "Posting…"
                                    : "Post reply"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  href={(() => {
                                    const text =
                                      item.selected === "humorous"
                                        ? (item.humorous ?? "").trim()
                                        : (item.insightful ?? "").trim();
                                    if (!text) return "#";
                                    return `https://twitter.com/intent/tweet?in_reply_to=${encodeURIComponent(item.id)}&text=${encodeURIComponent(text)}`;
                                  })()}
                                  external
                                  iconAfter={
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  }
                                  className={
                                    (item.selected === "humorous" &&
                                      (item.humorous ?? "").trim()) ||
                                    (item.selected === "insightful" &&
                                      (item.insightful ?? "").trim())
                                      ? ""
                                      : "opacity-50 pointer-events-none"
                                  }
                                >
                                  Open in X to post
                                </Button>
                              </div>
                              <p className="mt-1.5 text-xs text-muted">
                                Use “Open in X to post” when the API reply is
                                not allowed.
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Card>
      )}

      {message && (
        <div
          role="alert"
          className={cn(
            "rounded-card p-4",
            message.type === "success"
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error",
          )}
        >
          {message.text}
        </div>
      )}
    </SectionLayout>
  );
};

export default FeedPage;

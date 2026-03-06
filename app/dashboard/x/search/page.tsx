"use client";

import { useCallback, useEffect, useState } from "react";
import { Reply, Trash2, ExternalLink } from "lucide-react";

import type { StoredTweet, VariantChoice } from "@/types/tweet";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import Input from "@/components/form/Input";
import Textarea from "@/components/form/Textarea";
import {
  SEARCH_DEFAULT_MAX_RESULTS,
  SEARCH_MAX_RESULTS_MAX,
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

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(SEARCH_DEFAULT_MAX_RESULTS);
  const [items, setItems] = useState<StoredTweet[]>([]);
  const [message, setMessage] = useState<Message | null>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingReplyForId, setLoadingReplyForId] = useState<string | null>(
    null,
  );
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [postingForId, setPostingForId] = useState<string | null>(null);

  const showMessage = useCallback((type: "success" | "error", text: string) => {
    setMessage({ type, text });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(ROUTES.API_X_SEARCH_SAVED)
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

  const handleSearch = async () => {
    if (!query.trim()) {
      showMessage("error", "Enter at least one keyword to search.");
      return;
    }
    setLoadingSearch(true);
    setMessage(null);
    try {
      const res = await fetch(ROUTES.API_X_SEARCH_WITH_REPLIES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          maxResults: Math.min(Math.max(maxResults, 1), SEARCH_MAX_RESULTS_MAX),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      const mapped: StoredTweet[] = (data.items ?? []).map(
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
      await fetch(ROUTES.API_X_SEARCH_SAVED, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: mapped }),
      }).catch(() => {});
      if (mapped.length === 0) {
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

  const handleDeleteTweet = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      fetch(ROUTES.API_X_SEARCH_SAVED, {
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
        await fetch(ROUTES.API_X_SEARCH_SAVED, {
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
      await fetch(ROUTES.API_X_SEARCH_SAVED, {
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
      <h1 className="text-h2 font-semibold tracking-tight mb-2">
        Search by keyword
      </h1>
      <p className="text-muted mb-6">
        Search tweets and generate Humorous &amp; Insightful reply options.
        Results are stored in data/x/search.json.
      </p>

      <Card title="Search" className="mb-8">
        <div className="flex flex-wrap gap-2 items-end">
          <Input
            label="Query"
            id="search-query"
            placeholder="e.g. nextjs OR react lang:en"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            name="query"
            className="min-w-[200px] flex-1"
          />
          <Input
            label="Max (1–20)"
            type="number"
            min={1}
            max={SEARCH_MAX_RESULTS_MAX}
            value={String(maxResults)}
            onChange={(e) =>
              setMaxResults(
                Number.isNaN(Number(e.target.value))
                  ? SEARCH_DEFAULT_MAX_RESULTS
                  : Math.min(
                      SEARCH_MAX_RESULTS_MAX,
                      Math.max(1, Number.parseInt(e.target.value, 10)),
                    ),
              )
            }
            name="maxResults"
            className="w-20"
          />
          <Button onClick={handleSearch} disabled={loadingSearch}>
            {loadingSearch ? "Searching…" : "Search & generate"}
          </Button>
        </div>
      </Card>

      {items.length > 0 && (
        <Card title="Results" className="mb-8">
          <p className="text-sm text-muted mb-4">
            Click Reply to regenerate options. Delete removes from list.
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
                      <p className="text-[15px] text-foreground whitespace-pre-wrap break-words mt-0.5 leading-snug">
                        {item.text}
                      </p>
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

export default SearchPage;

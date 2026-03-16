"use client";

import { useEffect, useState } from "react";

import type { StoredTweet, SearchWithRepliesItem } from "@/types/tweet";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import Input from "@/components/form/Input";
import TweetCard from "@/components/dashboard/TweetCard";
import FlashMessageBar from "@/components/dashboard/FlashMessageBar";
import {
  SEARCH_DEFAULT_MAX_RESULTS,
  SEARCH_MAX_RESULTS_MAX,
} from "@/constants/defaults";
import { ROUTES } from "@/constants/routes";
import { useTweetList } from "@/hooks/useTweetList";
import { mapSearchWithRepliesToStored } from "@/utils/tweet";
import { postJson, safeJson } from "@/utils/http";

const SearchPage = () => {
  const {
    items,
    setItems,
    message,
    showMessage,
    loadingReplyForId,
    replyingToId,
    setReplyingToId,
    postingForId,
    handleChangeSelection,
    handleDeleteTweet,
    handleReplyClick,
    handlePostFor,
    updateItem,
  } = useTweetList(ROUTES.API_X_SEARCH_SAVED);

  const [query, setQuery] = useState("");
  const [maxResults, setMaxResults] = useState(SEARCH_DEFAULT_MAX_RESULTS);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(ROUTES.API_X_SEARCH_SAVED)
      .then((res) => safeJson<{ items?: StoredTweet[] }>(res, {}))
      .then((data: { items?: StoredTweet[] }) => {
        if (cancelled || !Array.isArray(data.items)) return;
        if (data.items.length > 0) setItems(data.items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [setItems]);

  const handleSearch = async () => {
    if (!query.trim()) {
      showMessage("error", "Enter at least one keyword to search.");
      return;
    }
    setLoadingSearch(true);
    try {
      const { res, data } = await postJson<{
        items?: SearchWithRepliesItem[];
        error?: string;
      }>(ROUTES.API_X_SEARCH_WITH_REPLIES, {
        query: query.trim(),
        maxResults: Math.min(Math.max(maxResults, 1), SEARCH_MAX_RESULTS_MAX),
      });
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      const raw = (data.items ?? []) as SearchWithRepliesItem[];
      const mapped = mapSearchWithRepliesToStored(raw);
      setItems(mapped);
      await postJson(ROUTES.API_X_SEARCH_SAVED, { items: mapped }).catch(() => {});
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
            className="min-w-50 flex-1"
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
            {items.map((item) => (
              <TweetCard
                key={item.id}
                item={item}
                isReplying={replyingToId === item.id}
                isLoadingReply={loadingReplyForId === item.id}
                isPosting={postingForId === item.id}
                onReplyClick={() => handleReplyClick(item)}
                onCloseReply={() => setReplyingToId(null)}
                onDelete={() => handleDeleteTweet(item.id)}
                onSelectionChange={(choice) =>
                  handleChangeSelection(item.id, choice)
                }
                onHumorousChange={(value) =>
                  updateItem(item.id, { humorous: value })
                }
                onInsightfulChange={(value) =>
                  updateItem(item.id, { insightful: value })
                }
                onPostReply={() => handlePostFor(item.id)}
              />
            ))}
          </div>
        </Card>
      )}

      <FlashMessageBar message={message} />
    </SectionLayout>
  );
};

export default SearchPage;

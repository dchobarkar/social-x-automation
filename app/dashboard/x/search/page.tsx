"use client";

import { useState } from "react";

import type { SearchWithRepliesItem } from "@/types/x/tweet";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/form/Input";
import FlashMessageBar from "@/components/dashboard/FlashMessageBar";
import TweetListSection from "@/components/dashboard/TweetListSection";
import {
  SEARCH_DEFAULT_MAX_RESULTS,
  SEARCH_MAX_RESULTS_MAX,
} from "@/constants/x/defaults";
import { ROUTES } from "@/constants/routes";
import { useLoadSavedTweets } from "@/hooks/useLoadSavedTweets";
import { useTweetList } from "@/hooks/useTweetList";
import { mapSearchWithRepliesToStored } from "@/utils/tweet";
import { postJson } from "@/utils/http";
import { persistSavedItems } from "@/utils/savedItems";

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

  useLoadSavedTweets({ endpoint: ROUTES.API_X_SEARCH_SAVED, onLoad: setItems });

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
      await persistSavedItems(ROUTES.API_X_SEARCH_SAVED, mapped);
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
      <PageHeader
        title="Search by keyword"
        description="Search tweets and generate Humorous &amp; Insightful reply options. Results are stored in data/x/search.json."
      />

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

      <TweetListSection
        items={items}
        title="Results"
        description="Click Reply to regenerate options. Delete removes from list."
        loadingReplyForId={loadingReplyForId}
        replyingToId={replyingToId}
        postingForId={postingForId}
        onReplyClick={handleReplyClick}
        onCloseReply={() => setReplyingToId(null)}
        onDelete={handleDeleteTweet}
        onSelectionChange={handleChangeSelection}
        onHumorousChange={(id, value) => updateItem(id, { humorous: value })}
        onInsightfulChange={(id, value) =>
          updateItem(id, { insightful: value })
        }
        onPostReply={handlePostFor}
        className="mb-8"
      />

      <FlashMessageBar message={message} />
    </SectionLayout>
  );
};

export default SearchPage;

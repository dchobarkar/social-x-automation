"use client";

import { useCallback, useEffect, useState } from "react";

import type { FeedApiItem } from "@/types/x/tweet";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SectionLayout from "@/components/ui/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/form/Input";
import Checkbox from "@/components/form/Checkbox";
import Select from "@/components/form/Select";
import FlashMessageBar from "@/components/dashboard/FlashMessageBar";
import TweetListSection from "@/components/dashboard/TweetListSection";
import {
  FEED_DEFAULT_MAX_RESULTS,
  FEED_LAST_HOURS_OPTIONS,
} from "@/constants/defaults";
import { ROUTES } from "@/constants/routes";
import { useTweetList } from "@/hooks/useTweetList";
import { mapFeedApiItemsToStored, mergeFeedWithExisting } from "@/utils/tweet";
import { postJson } from "@/utils/http";
import { getSavedItems, persistSavedItems } from "@/utils/savedItems";

const FeedPage = () => {
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
  } = useTweetList(ROUTES.API_X_FEED_SAVED);

  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedLastHours, setFeedLastHours] = useState<number | "">("");
  const [feedMaxResults, setFeedMaxResults] = useState(
    FEED_DEFAULT_MAX_RESULTS,
  );
  const [feedExcludeReplies, setFeedExcludeReplies] = useState(true);
  const [feedExcludeRetweets, setFeedExcludeRetweets] = useState(true);
  const [feedMaxReplyCount, setFeedMaxReplyCount] = useState("");
  const [feedMinAuthorFollowers, setFeedMinAuthorFollowers] = useState("");

  useEffect(() => {
    let cancelled = false;
    getSavedItems(ROUTES.API_X_FEED_SAVED).then((items) => {
      if (cancelled || items.length === 0) return;
      setItems(items);
    });
    return () => {
      cancelled = true;
    };
  }, [setItems]);

  const handleLoadFeed = useCallback(async () => {
    setLoadingFeed(true);
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
      const { res, data } = await postJson<{
        items?: FeedApiItem[];
        error?: string;
      }>(ROUTES.API_X_FEED, body);
      if (!res.ok) throw new Error(data.error ?? "Load feed failed");
      const raw = (data.items ?? []) as FeedApiItem[];
      const mapped = mapFeedApiItemsToStored(raw);
      const merged = mergeFeedWithExisting(items, mapped);
      setItems(merged);
      await persistSavedItems(ROUTES.API_X_FEED_SAVED, merged);
      if (mapped.length === 0) {
        showMessage("success", "No new tweets in your feed for these filters.");
      } else {
        showMessage(
          "success",
          `Added ${mapped.length} tweet(s). Feed now has ${merged.length} total.`,
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
  }, [
    items,
    feedLastHours,
    feedMaxResults,
    feedExcludeReplies,
    feedExcludeRetweets,
    feedMaxReplyCount,
    feedMinAuthorFollowers,
    showMessage,
    setItems,
  ]);

  return (
    <SectionLayout padding="none" variant="transparent" as="div">
      <PageHeader
        title="Home Feed"
        description="Load your X home timeline. Tweets are stored in data/x/feed.json. Click Reply to generate options with OpenAI."
      />

      <Card title="Load feed" className="mb-8">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="Posted in last"
              value={feedLastHours === "" ? "" : String(feedLastHours)}
              onChange={(e) =>
                setFeedLastHours(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              name="feedLastHours"
              options={[
                { value: "", label: "All time" },
                ...FEED_LAST_HOURS_OPTIONS.map((h) => ({
                  value: String(h),
                  label: `${h} hour${h !== 1 ? "s" : ""}`,
                })),
              ]}
            />
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

      <TweetListSection
        items={items}
        title="Tweets"
        description="Click Reply to generate Humorous &amp; Insightful options. Delete removes from list."
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

export default FeedPage;

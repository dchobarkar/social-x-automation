"use client";

import { useCallback, useState } from "react";

import type { FeedApiItem, StoredTweet } from "@/types/x/tweet";
import SectionLayout from "@/components/ui/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessageBar from "@/components/ui/FlashMessageBar";
import FeedFilterBox from "@/components/dashboard/x/FeedFilterBox";
import TweetListSection from "@/components/dashboard/x/TweetListSection";
import { X_FEED_DEFAULT_MAX_RESULTS } from "@/constants/x/feed";
import { mapFeedApiItemsToStored, mergeFeedWithExisting } from "@/utils/tweet";
import { useXFeedTweetList } from "@/hooks/useXFeedTweetList";
import { loadXFeedAction } from "@/services/x/feed.actions";

const XFeedDashboardClient = ({
  initialItems,
}: {
  initialItems: StoredTweet[];
}) => {
  const {
    items,
    replaceItems,
    updateItems,
    message,
    showMessage,
    loadingReplyForId,
    replyingToId,
    setReplyingToId,
    replyUiByTweetId,
    handleChangeSelection,
    handleDeleteTweet,
    handleReplyClick,
    setReplyTone,
    generateReplyForId,
  } = useXFeedTweetList(initialItems);

  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedLastHours, setFeedLastHours] = useState<number | "">("");
  const [feedMaxResults, setFeedMaxResults] = useState(
    X_FEED_DEFAULT_MAX_RESULTS,
  );
  const [feedExcludeReplies, setFeedExcludeReplies] = useState(true);
  const [feedExcludeRetweets, setFeedExcludeRetweets] = useState(true);
  const [feedMaxReplyCount, setFeedMaxReplyCount] = useState("");
  const [feedMinAuthorFollowers, setFeedMinAuthorFollowers] = useState("");

  const handleLoadFeed = useCallback(async () => {
    setLoadingFeed(true);

    try {
      const filters: {
        maxResults: number;
        excludeReplies: boolean;
        excludeRetweets: boolean;
        lastHours?: number;
        maxReplyCount?: number;
        minAuthorFollowers?: number;
      } = {
        maxResults: Math.min(Math.max(feedMaxResults, 1), 100),
        excludeReplies: feedExcludeReplies,
        excludeRetweets: feedExcludeRetweets,
      };

      if (feedLastHours !== "") {
        const h = Number(feedLastHours);
        if (Number.isFinite(h) && h > 0) filters.lastHours = h;
      }

      if (feedMaxReplyCount.trim() !== "") {
        const n = Number.parseInt(feedMaxReplyCount, 10);
        if (Number.isFinite(n) && n >= 0) filters.maxReplyCount = n;
      }

      if (feedMinAuthorFollowers.trim() !== "") {
        const n = Number.parseInt(feedMinAuthorFollowers, 10);
        if (Number.isFinite(n) && n >= 0) filters.minAuthorFollowers = n;
      }

      const raw = (await loadXFeedAction(filters)) as FeedApiItem[];
      const mapped = mapFeedApiItemsToStored(raw);
      const merged = mergeFeedWithExisting(items, mapped);
      replaceItems(merged);

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
    replaceItems,
  ]);

  return (
    <SectionLayout padding="none" variant="transparent" as="div">
      <PageHeader
        title="Home Feed"
        description="Load your X home timeline. Tweets are stored in data/x/feed.json. Generate AI reply drafts, then open X to post manually."
      />

      <FeedFilterBox
        className="mb-8"
        feedLastHours={feedLastHours}
        setFeedLastHours={setFeedLastHours}
        feedMaxResults={feedMaxResults}
        setFeedMaxResults={setFeedMaxResults}
        feedExcludeReplies={feedExcludeReplies}
        setFeedExcludeReplies={setFeedExcludeReplies}
        feedExcludeRetweets={feedExcludeRetweets}
        setFeedExcludeRetweets={setFeedExcludeRetweets}
        feedMaxReplyCount={feedMaxReplyCount}
        setFeedMaxReplyCount={setFeedMaxReplyCount}
        feedMinAuthorFollowers={feedMinAuthorFollowers}
        setFeedMinAuthorFollowers={setFeedMinAuthorFollowers}
        loadingFeed={loadingFeed}
        onLoadFeed={handleLoadFeed}
      />

      <FlashMessageBar message={message} />

      <TweetListSection
        items={items}
        title="Tweets"
        replyUiByTweetId={replyUiByTweetId}
        loadingReplyForId={loadingReplyForId}
        replyingToId={replyingToId}
        onReplyClick={handleReplyClick}
        onCloseReply={() => setReplyingToId(null)}
        onDelete={handleDeleteTweet}
        onSelectionChange={handleChangeSelection}
        onToneChange={(id, tone) => setReplyTone(id, tone)}
        onReplyChange={(id, value) =>
          updateItems((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, [item.selected]: value } : item,
            ),
          )
        }
        onGenerate={generateReplyForId}
        className="mb-8"
      />
    </SectionLayout>
  );
};

export default XFeedDashboardClient;

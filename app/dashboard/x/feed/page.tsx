"use client";

import { useCallback, useState } from "react";

import type { FeedApiItem } from "@/types/x/tweet";
import SectionLayout from "@/components/ui/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessageBar from "@/components/ui/FlashMessageBar";
import FeedFilterBox from "@/components/dashboard/x/FeedFilterBox";
import TweetListSection from "@/components/dashboard/x/TweetListSection";
import { FEED_DEFAULT_MAX_RESULTS } from "@/constants/x/defaults";
import { ROUTES } from "@/constants/routes";
import { mapFeedApiItemsToStored, mergeFeedWithExisting } from "@/utils/tweet";
import { postJson } from "@/utils/http";
import { persistSavedItems } from "@/utils/savedItems";
import { useLoadSavedTweets } from "@/hooks/useLoadSavedTweets";
import { useTweetList } from "@/hooks/useTweetList";

const Page = () => {
  const {
    items,
    setItems,
    message,
    showMessage,
    loadingReplyForId,
    replyingToId,
    setReplyingToId,
    postingForId,
    replyUI,
    handleChangeSelection,
    handleDeleteTweet,
    handleReplyClick,
    handlePostFor,
    setReplyTone,
    generateReplyForId,
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

  useLoadSavedTweets({ endpoint: ROUTES.API_X_FEED_SAVED, onLoad: setItems });

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
      if (mapped.length === 0)
        showMessage("success", "No new tweets in your feed for these filters.");
      else
        showMessage(
          "success",
          `Added ${mapped.length} tweet(s). Feed now has ${merged.length} total.`,
        );
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
        replyUI={replyUI}
        loadingReplyForId={loadingReplyForId}
        replyingToId={replyingToId}
        postingForId={postingForId}
        onReplyClick={handleReplyClick}
        onCloseReply={() => setReplyingToId(null)}
        onDelete={handleDeleteTweet}
        onSelectionChange={handleChangeSelection}
        onToneChange={(id, tone) => setReplyTone(id, tone)}
        onReplyChange={(id, value) =>
          setItems((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, [item.selected]: value } : item,
            ),
          )
        }
        onGenerate={generateReplyForId}
        onPostReply={handlePostFor}
        className="mb-8"
      />
    </SectionLayout>
  );
};

export default Page;

"use client";

import { useCallback, useState } from "react";
import { Bot, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

import type { FeedApiItem, StoredTweet } from "@/types/x/tweet";
import SectionLayout from "@/components/ui/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessageBar from "@/components/ui/FlashMessageBar";
import FeedFilterBox from "@/components/dashboard/x/FeedFilterBox";
import TweetListSection from "@/components/dashboard/x/TweetListSection";
import { X_FEED_DEFAULT_MAX_RESULTS } from "@/constants/x/feed";
import {
  mapFeedApiItemsToStored,
  mergeStoredTweetsWithExisting,
} from "@/utils/tweet";
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
  const draftedCount = items.filter((item) =>
    Boolean(item[item.selected]),
  ).length;
  const safeCount = items.filter((item) => {
    const validation = replyUiByTweetId[item.id]?.validation;
    return validation?.isSafe;
  }).length;
  const averageFollowers =
    items.length > 0
      ? Math.round(
          items.reduce(
            (sum, item) => sum + (item.author_followers_count ?? 0),
            0,
          ) / items.length,
        )
      : 0;

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
      const merged = mergeStoredTweetsWithExisting(items, mapped);
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
      <div className="mb-8 overflow-hidden rounded-4xl border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft) backdrop-blur-xl md:p-8">
        <PageHeader
          title="Home Feed"
          description="Review your X timeline in one place, generate reply drafts in context, and move to X only for the final posting step."
          className="mb-0"
        />

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Saved posts",
              value: String(items.length),
              hint: "Current feed workspace",
              icon: TrendingUp,
            },
            {
              label: "Drafted replies",
              value: String(draftedCount),
              hint: "Posts with an active draft",
              icon: Sparkles,
            },
            {
              label: "Validated safe",
              value: String(safeCount),
              hint: "Replies cleared by validation",
              icon: ShieldCheck,
            },
            {
              label: "Avg followers",
              value: averageFollowers.toLocaleString(),
              hint: "Average author reach loaded",
              icon: Bot,
            },
          ].map(({ label, value, hint, icon: Icon }) => (
            <div
              key={label}
              className="rounded-3xl border border-border/70 bg-surface p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/75">
                    {label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">
                    {value}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{hint}</p>
            </div>
          ))}
        </div>
      </div>

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

      <FlashMessageBar message={message} className="mb-8" />

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

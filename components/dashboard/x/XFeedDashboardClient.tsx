"use client";

import { useCallback, useMemo, useState } from "react";
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
  const [feedEnglishOnly, setFeedEnglishOnly] = useState(true);
  const [feedMaxReplyCount, setFeedMaxReplyCount] = useState("");
  const [feedMinAuthorFollowers, setFeedMinAuthorFollowers] = useState("");
  const [nextToken, setNextToken] = useState<string | null>(null);
  const { draftedCount, safeCount, averageFollowers } = useMemo(() => {
    let drafted = 0;
    let safe = 0;
    let totalFollowers = 0;

    for (const item of items) {
      if (item[item.selected]) drafted += 1;
      if (replyUiByTweetId[item.id]?.validation?.isSafe) safe += 1;
      totalFollowers += item.author_followers_count ?? 0;
    }

    return {
      draftedCount: drafted,
      safeCount: safe,
      averageFollowers:
        items.length > 0 ? Math.round(totalFollowers / items.length) : 0,
    };
  }, [items, replyUiByTweetId]);

  const requestPreview = useMemo(() => {
    const parts = [
      `max_results=${Math.min(Math.max(feedMaxResults, 1), 100)}`,
      feedLastHours === "" ? "time=all" : `last_hours=${String(feedLastHours)}`,
      feedExcludeReplies ? "exclude=replies" : "",
      feedExcludeRetweets ? "exclude=retweets" : "",
      feedEnglishOnly ? "lang=en" : "",
      feedMaxReplyCount.trim()
        ? `max_reply_count=${feedMaxReplyCount.trim()}`
        : "",
      feedMinAuthorFollowers.trim()
        ? `min_author_followers=${feedMinAuthorFollowers.trim()}`
        : "",
    ].filter(Boolean);

    return parts.join(" | ");
  }, [
    feedMaxResults,
    feedLastHours,
    feedExcludeReplies,
    feedExcludeRetweets,
    feedEnglishOnly,
    feedMaxReplyCount,
    feedMinAuthorFollowers,
  ]);

  const handleLoadFeed = useCallback(
    async (loadMore = false) => {
      setLoadingFeed(true);

      try {
        const filters: {
          maxResults: number;
          excludeReplies: boolean;
          excludeRetweets: boolean;
          englishOnly: boolean;
          lastHours?: number;
          maxReplyCount?: number;
          minAuthorFollowers?: number;
          paginationToken?: string;
        } = {
          maxResults: Math.min(Math.max(feedMaxResults, 1), 100),
          excludeReplies: feedExcludeReplies,
          excludeRetweets: feedExcludeRetweets,
          englishOnly: feedEnglishOnly,
          paginationToken: loadMore ? (nextToken ?? undefined) : undefined,
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

        const result = await loadXFeedAction(filters);
        const mapped = mapFeedApiItemsToStored(result.posts as FeedApiItem[]);
        const merged = mergeStoredTweetsWithExisting(items, mapped);
        replaceItems(merged);
        setNextToken(result.nextToken ?? null);

        if (mapped.length === 0) {
          showMessage(
            "success",
            loadMore
              ? "No additional tweets were returned for these filters."
              : "No new tweets in your feed for these filters.",
          );
        } else {
          showMessage(
            "success",
            loadMore
              ? `Added ${mapped.length} more tweet(s). Feed now has ${merged.length} total.`
              : `Loaded ${mapped.length} tweet(s). Feed now has ${merged.length} total.`,
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
    },
    [
      items,
      feedLastHours,
      feedMaxResults,
      feedExcludeReplies,
      feedExcludeRetweets,
      feedEnglishOnly,
      feedMaxReplyCount,
      feedMinAuthorFollowers,
      nextToken,
      showMessage,
      replaceItems,
    ],
  );

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
        feedEnglishOnly={feedEnglishOnly}
        setFeedEnglishOnly={setFeedEnglishOnly}
        feedMaxReplyCount={feedMaxReplyCount}
        setFeedMaxReplyCount={setFeedMaxReplyCount}
        feedMinAuthorFollowers={feedMinAuthorFollowers}
        setFeedMinAuthorFollowers={setFeedMinAuthorFollowers}
        requestPreview={requestPreview}
        loadingFeed={loadingFeed}
        hasNextPage={Boolean(nextToken)}
        onLoadFeed={() => void handleLoadFeed(false)}
        onLoadMore={() => void handleLoadFeed(true)}
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

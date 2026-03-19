"use client";

import { useCallback, useMemo, useState } from "react";
import { Bot, Search, ShieldCheck, Sparkles } from "lucide-react";

import type { StoredTweet } from "@/types/x/tweet";
import type { XSearchSortOrder } from "@/types/x/search";
import SectionLayout from "@/components/ui/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import FlashMessageBar from "@/components/ui/FlashMessageBar";
import SearchFilterBox from "@/components/dashboard/x/SearchFilterBox";
import TweetListSection from "@/components/dashboard/x/TweetListSection";
import { X_SEARCH_DEFAULT_MAX_RESULTS } from "@/constants/x/search";
import { mergeStoredTweetsWithExisting } from "@/utils/tweet";
import {
  buildSearchQuery,
  mapSearchPostsToStored,
  splitSearchTerms,
} from "@/utils/xSearch";
import { useXSearchTweetList } from "@/hooks/useXSearchTweetList";
import { loadXSearchAction } from "@/services/x/search.actions";

const XSearchDashboardClient = ({
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
  } = useXSearchTweetList(initialItems);

  const [keywords, setKeywords] = useState("");
  const [exactPhrases, setExactPhrases] = useState("");
  const [fromUsers, setFromUsers] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [maxResults, setMaxResults] = useState(X_SEARCH_DEFAULT_MAX_RESULTS);
  const [sortOrder, setSortOrder] = useState<XSearchSortOrder>("recency");
  const [excludeRetweets, setExcludeRetweets] = useState(true);
  const [englishOnly, setEnglishOnly] = useState(true);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState("");

  const queryPreview = useMemo(
    () =>
      buildSearchQuery({
        keywords: splitSearchTerms(keywords),
        exactPhrases: splitSearchTerms(exactPhrases),
        fromUsers: splitSearchTerms(fromUsers),
        hashtags: splitSearchTerms(hashtags),
        excludeRetweets,
        englishOnly,
        verifiedOnly,
      }),
    [
      keywords,
      exactPhrases,
      fromUsers,
      hashtags,
      excludeRetweets,
      englishOnly,
      verifiedOnly,
    ],
  );

  const { draftedCount, safeCount, uniqueAuthors } = useMemo(() => {
    let drafted = 0;
    let safe = 0;
    const authors = new Set<string>();

    for (const item of items) {
      if (item[item.selected]) drafted += 1;
      if (replyUiByTweetId[item.id]?.validation?.isSafe) safe += 1;
      authors.add(item.author_username ?? item.author_name ?? item.id);
    }

    return {
      draftedCount: drafted,
      safeCount: safe,
      uniqueAuthors: authors.size,
    };
  }, [items, replyUiByTweetId]);

  const handleSearch = useCallback(
    async (loadMore = false) => {
      setLoadingSearch(true);

      try {
        const result = await loadXSearchAction({
          keywords: splitSearchTerms(keywords),
          exactPhrases: splitSearchTerms(exactPhrases),
          fromUsers: splitSearchTerms(fromUsers),
          hashtags: splitSearchTerms(hashtags),
          excludeRetweets,
          englishOnly,
          verifiedOnly,
          maxResults,
          sortOrder,
          nextToken: loadMore ? (nextToken ?? undefined) : undefined,
        });

        const mapped = mapSearchPostsToStored(result.posts);
        const nextItems = mergeStoredTweetsWithExisting(items, mapped);

        replaceItems(nextItems);
        setNextToken(result.nextToken ?? null);
        setActiveQuery(result.query);

        if (mapped.length === 0) {
          showMessage(
            "success",
            loadMore
              ? "No additional posts were returned for this query."
              : "No posts matched the current search query.",
          );
        } else {
          showMessage(
            "success",
            loadMore
              ? `Added ${mapped.length} more post(s). Workspace now has ${nextItems.length} total.`
              : `Loaded ${mapped.length} post(s) for the current search query.`,
          );
        }
      } catch (error) {
        showMessage(
          "error",
          error instanceof Error ? error.message : "Failed to search posts",
        );
      } finally {
        setLoadingSearch(false);
      }
    },
    [
      keywords,
      exactPhrases,
      fromUsers,
      hashtags,
      excludeRetweets,
      englishOnly,
      verifiedOnly,
      maxResults,
      sortOrder,
      nextToken,
      items,
      replaceItems,
      showMessage,
    ],
  );

  return (
    <SectionLayout padding="none" variant="transparent" as="div">
      <div className="mb-8 overflow-hidden rounded-4xl border border-white/70 bg-white/80 p-6 shadow-(--shadow-soft) backdrop-blur-xl md:p-8">
        <PageHeader
          title="Recent Search"
          description="Discover fresh X posts with structured recent search, then use the same draft-first reply workflow you already have in feed."
          className="mb-0"
        />

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Saved posts",
              value: String(items.length),
              hint: "Current search workspace",
              icon: Search,
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
              label: "Unique authors",
              value: String(uniqueAuthors),
              hint: activeQuery
                ? activeQuery
                : "Build a query to start discovery",
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
              <p className="mt-3 line-clamp-2 text-sm text-muted">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      <SearchFilterBox
        className="mb-8"
        keywords={keywords}
        setKeywords={setKeywords}
        exactPhrases={exactPhrases}
        setExactPhrases={setExactPhrases}
        fromUsers={fromUsers}
        setFromUsers={setFromUsers}
        hashtags={hashtags}
        setHashtags={setHashtags}
        maxResults={maxResults}
        setMaxResults={setMaxResults}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        excludeRetweets={excludeRetweets}
        setExcludeRetweets={setExcludeRetweets}
        englishOnly={englishOnly}
        setEnglishOnly={setEnglishOnly}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
        queryPreview={queryPreview}
        loading={loadingSearch}
        hasNextPage={Boolean(nextToken)}
        onSearch={() => void handleSearch(false)}
        onLoadMore={() => void handleSearch(true)}
      />

      <FlashMessageBar message={message} className="mb-8" />

      <TweetListSection
        items={items}
        title="Search Results"
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

export default XSearchDashboardClient;

import type { XSearchSortOrder } from "@/types/x/search";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/form/Checkbox";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import { X_SEARCH_SORT_OPTIONS } from "@/constants/x/search";

export type SearchFilterBoxProps = {
  keywords: string;
  setKeywords: (value: string) => void;
  exactPhrases: string;
  setExactPhrases: (value: string) => void;
  fromUsers: string;
  setFromUsers: (value: string) => void;
  hashtags: string;
  setHashtags: (value: string) => void;
  maxResults: number;
  setMaxResults: (value: number) => void;
  sortOrder: XSearchSortOrder;
  setSortOrder: (value: XSearchSortOrder) => void;
  excludeRetweets: boolean;
  setExcludeRetweets: (value: boolean) => void;
  queryPreview: string;
  loading: boolean;
  hasNextPage: boolean;
  onSearch: () => void;
  onLoadMore: () => void;
  className?: string;
};

const SearchFilterBox = ({
  keywords,
  setKeywords,
  exactPhrases,
  setExactPhrases,
  fromUsers,
  setFromUsers,
  hashtags,
  setHashtags,
  maxResults,
  setMaxResults,
  sortOrder,
  setSortOrder,
  excludeRetweets,
  setExcludeRetweets,
  queryPreview,
  loading,
  hasNextPage,
  onSearch,
  onLoadMore,
  className,
}: SearchFilterBoxProps) => {
  return (
    <Card className={className}>
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <Input
            label="Keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            name="searchKeywords"
            placeholder="nextjs, startup"
            description="Comma or newline separated words. These become the core query terms."
          />

          <Input
            label="Exact phrases"
            value={exactPhrases}
            onChange={(e) => setExactPhrases(e.target.value)}
            name="searchExactPhrases"
            placeholder="build in public, ai agents"
            description="Wrap intent-heavy phrases automatically without passing raw query strings around."
          />

          <Input
            label="From users"
            value={fromUsers}
            onChange={(e) => setFromUsers(e.target.value)}
            name="searchFromUsers"
            placeholder="vercel, leeerob"
            description="Comma or newline separated handles. The builder converts them to from:user operators."
          />

          <Input
            label="Hashtags"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            name="searchHashtags"
            placeholder="nextjs, webdev"
            description="Comma or newline separated tags. You can omit the # prefix."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Input
            label="Max results (10-100)"
            type="number"
            min={10}
            max={100}
            value={String(maxResults)}
            onChange={(e) =>
              setMaxResults(
                Math.min(
                  100,
                  Math.max(10, Number.parseInt(e.target.value, 10) || 10),
                ),
              )
            }
            name="searchMaxResults"
            description="Recent search requires batches of at least 10 posts."
          />

          <Select
            label="Sort order"
            name="searchSortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as XSearchSortOrder)}
            options={X_SEARCH_SORT_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            description="Recency is better for live conversations; relevancy is better for focused discovery."
          />

          <div className="flex items-end">
            <Checkbox
              name="searchExcludeRetweets"
              label="Exclude reposts"
              checked={excludeRetweets}
              onChange={(e) => setExcludeRetweets(e.target.checked)}
              description="Adds -is:retweet to keep the workspace closer to original posts."
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border/70 bg-surface-strong p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/75">
            Query preview
          </p>
          <p className="mt-2 wrap-break-word font-mono text-sm text-foreground">
            {queryPreview ||
              "Add keywords, phrases, users, or hashtags to build the query."}
          </p>
        </div>

        <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-surface-strong p-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm text-muted">
            Run a fresh search to replace the workspace, or load more to append
            the next page.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onSearch} disabled={loading}>
              {loading ? "Searching…" : "Search posts"}
            </Button>
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={loading || !hasNextPage}
            >
              Load more
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SearchFilterBox;

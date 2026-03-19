import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/form/Checkbox";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import RequestPreviewBox from "@/components/dashboard/x/RequestPreviewBox";
import {
  X_FEED_DEFAULT_MAX_RESULTS,
  X_FEED_LAST_HOURS_OPTIONS,
} from "@/constants/x/feed";

export type FeedFilterBoxProps = {
  feedLastHours: number | "";
  setFeedLastHours: (value: number | "") => void;
  feedMaxResults: number;
  setFeedMaxResults: (value: number) => void;
  feedExcludeReplies: boolean;
  setFeedExcludeReplies: (value: boolean) => void;
  feedExcludeRetweets: boolean;
  setFeedExcludeRetweets: (value: boolean) => void;
  feedEnglishOnly: boolean;
  setFeedEnglishOnly: (value: boolean) => void;
  feedMaxReplyCount: string;
  setFeedMaxReplyCount: (value: string) => void;
  feedMinAuthorFollowers: string;
  setFeedMinAuthorFollowers: (value: string) => void;
  requestPreview: string;
  loadingFeed: boolean;
  hasNextPage: boolean;
  onLoadFeed: () => void;
  onLoadMore: () => void;
  className?: string;
};

const FeedFilterBox = ({
  feedLastHours,
  setFeedLastHours,
  feedMaxResults,
  setFeedMaxResults,
  feedExcludeReplies,
  setFeedExcludeReplies,
  feedExcludeRetweets,
  setFeedExcludeRetweets,
  feedEnglishOnly,
  setFeedEnglishOnly,
  feedMaxReplyCount,
  setFeedMaxReplyCount,
  feedMinAuthorFollowers,
  setFeedMinAuthorFollowers,
  requestPreview,
  loadingFeed,
  hasNextPage,
  onLoadFeed,
  onLoadMore,
  className,
}: FeedFilterBoxProps) => {
  return (
    <Card className={className}>
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              ...X_FEED_LAST_HOURS_OPTIONS.map((h) => ({
                value: String(h),
                label: `${h} hour${h !== 1 ? "s" : ""}`,
              })),
            ]}
            description="Use a time window when you want fresher posts."
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
                      X_FEED_DEFAULT_MAX_RESULTS,
                  ),
                ),
              )
            }
            name="feedMaxResults"
            description="A smaller batch is easier to scan and draft quickly."
          />

          <Input
            label="Max reply count"
            placeholder="e.g. 20"
            value={feedMaxReplyCount}
            onChange={(e) => setFeedMaxReplyCount(e.target.value)}
            name="feedMaxReplyCount"
            description="Good for finding posts that are still open for replies."
          />

          <Input
            label="Min author followers"
            placeholder="e.g. 100"
            value={feedMinAuthorFollowers}
            onChange={(e) => setFeedMinAuthorFollowers(e.target.value)}
            name="feedMinAuthorFollowers"
            description="Use this if you want to bias toward higher reach accounts."
          />
        </div>

        <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-surface-strong p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-5">
            <Checkbox
              name="feedExcludeReplies"
              label="Exclude replies"
              checked={feedExcludeReplies}
              onChange={(e) => setFeedExcludeReplies(e.target.checked)}
              description="Keep the list focused on top-level posts."
            />

            <Checkbox
              name="feedExcludeRetweets"
              label="Exclude reposts"
              checked={feedExcludeRetweets}
              onChange={(e) => setFeedExcludeRetweets(e.target.checked)}
              description="Helpful when you only want original content."
            />

            <Checkbox
              name="feedEnglishOnly"
              label="English only"
              checked={feedEnglishOnly}
              onChange={(e) => setFeedEnglishOnly(e.target.checked)}
              description="Keeps only tweets where X reports the post language as English."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onLoadFeed} disabled={loadingFeed}>
              {loadingFeed ? "Loading feed…" : "Load feed"}
            </Button>
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={loadingFeed || !hasNextPage}
            >
              Load more
            </Button>
          </div>
        </div>

        <RequestPreviewBox
          title="Request preview"
          value={requestPreview}
          emptyText="Adjust the feed filters to preview the active request."
        />
      </div>
    </Card>
  );
};

export default FeedFilterBox;

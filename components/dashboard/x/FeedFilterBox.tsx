import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Checkbox from "@/components/form/Checkbox";
import Input from "@/components/form/Input";
import Select from "@/components/form/Select";
import {
  FEED_DEFAULT_MAX_RESULTS,
  FEED_LAST_HOURS_OPTIONS,
} from "@/constants/x/defaults";

export type FeedFilterBoxProps = {
  feedLastHours: number | "";
  setFeedLastHours: (value: number | "") => void;
  feedMaxResults: number;
  setFeedMaxResults: (value: number) => void;
  feedExcludeReplies: boolean;
  setFeedExcludeReplies: (value: boolean) => void;
  feedExcludeRetweets: boolean;
  setFeedExcludeRetweets: (value: boolean) => void;
  feedMaxReplyCount: string;
  setFeedMaxReplyCount: (value: string) => void;
  feedMinAuthorFollowers: string;
  setFeedMinAuthorFollowers: (value: string) => void;
  loadingFeed: boolean;
  onLoadFeed: () => void;
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
  feedMaxReplyCount,
  setFeedMaxReplyCount,
  feedMinAuthorFollowers,
  setFeedMinAuthorFollowers,
  loadingFeed,
  onLoadFeed,
  className,
}: FeedFilterBoxProps) => {
  return (
    <Card className={className}>
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

        <div className="flex flex-wrap items-center justify-end gap-4">
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

          <Button onClick={onLoadFeed} disabled={loadingFeed}>
            {loadingFeed ? "Loading feed…" : "Load feed"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default FeedFilterBox;

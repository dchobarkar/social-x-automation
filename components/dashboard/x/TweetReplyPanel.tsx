import type { StoredTweet, VariantChoice } from "@/types/x/tweet";
import Button from "@/components/ui/Button";
import Textarea from "@/components/form/Textarea";
import { buildTwitterReplyIntent } from "@/constants/x/dashboard";
import {
  REPLY_VARIANT_HUMOROUS,
  REPLY_VARIANT_INSIGHTFUL,
  REPLY_PLACEHOLDER_HUMOROUS,
  REPLY_PLACEHOLDER_INSIGHTFUL,
} from "@/constants/x/dashboard";
import { cn } from "@/utils/cn";

export type TweetReplyPanelProps = {
  item: StoredTweet;
  isReplying: boolean;
  isLoadingReply: boolean;
  isPosting: boolean;
  onCloseReply: () => void;
  onSelectionChange: (choice: VariantChoice) => void;
  onHumorousChange: (value: string) => void;
  onInsightfulChange: (value: string) => void;
  onPostReply: () => void;
};

const TweetReplyPanel = ({
  item,
  isReplying,
  isLoadingReply,
  isPosting,
  onCloseReply,
  onSelectionChange,
  onHumorousChange,
  onInsightfulChange,
  onPostReply,
}: TweetReplyPanelProps) => {
  if (!isReplying) return null;

  const selectedText =
    item.selected === "humorous"
      ? (item.humorous ?? "").trim()
      : (item.insightful ?? "").trim();
  const canPost =
    (item.selected === "humorous" && (item.humorous ?? "").trim()) ||
    (item.selected === "insightful" && (item.insightful ?? "").trim());

  return (
    <div className="mt-4 pt-4 border-t border-border space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Reply options</span>

        <Button variant="ghost" size="sm" type="button" onClick={onCloseReply}>
          Close
        </Button>
      </div>

      {isLoadingReply ? (
        <p className="text-sm text-muted">Generating reply options…</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                id={`humorous-${item.id}`}
                type="radio"
                name={`choice-${item.id}`}
                checked={item.selected === "humorous"}
                onChange={() => onSelectionChange("humorous")}
                className="rounded-full border-border text-primary focus:ring-primary/30"
              />
              <label
                htmlFor={`humorous-${item.id}`}
                className="text-sm font-medium"
              >
                {REPLY_VARIANT_HUMOROUS}
              </label>
            </div>
            <Textarea
              rows={2}
              value={item.humorous ?? ""}
              onChange={(e) => onHumorousChange(e.target.value)}
              placeholder={REPLY_PLACEHOLDER_HUMOROUS}
              name={`humorous-${item.id}`}
            />
            <div className="flex items-center gap-2">
              <input
                id={`insightful-${item.id}`}
                type="radio"
                name={`choice-${item.id}`}
                checked={item.selected === "insightful"}
                onChange={() => onSelectionChange("insightful")}
                className="rounded-full border-border text-primary focus:ring-primary/30"
              />
              <label
                htmlFor={`insightful-${item.id}`}
                className="text-sm font-medium"
              >
                {REPLY_VARIANT_INSIGHTFUL}
              </label>
            </div>
            <Textarea
              rows={2}
              value={item.insightful ?? ""}
              onChange={(e) => onInsightfulChange(e.target.value)}
              placeholder={REPLY_PLACEHOLDER_INSIGHTFUL}
              name={`insightful-${item.id}`}
            />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              type="button"
              onClick={onPostReply}
              disabled={isPosting || !canPost}
            >
              {isPosting ? "Posting…" : "Post reply"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              href={buildTwitterReplyIntent(item.id, selectedText)}
              external
              className={cn(!canPost && "opacity-50 pointer-events-none")}
            >
              Open in X to post
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Use “Open in X to post” when the API reply is not allowed.
          </p>
        </>
      )}
    </div>
  );
};

export default TweetReplyPanel;

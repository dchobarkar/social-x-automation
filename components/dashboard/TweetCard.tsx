"use client";

import { Reply, Trash2, ExternalLink } from "lucide-react";

import type { StoredTweet, VariantChoice } from "@/types/tweet";
import Button from "@/components/ui/Button";
import Textarea from "@/components/form/Textarea";
import { formatRelativeTime } from "@/utils/date";
import { buildTwitterReplyIntent } from "@/constants/dashboard";
import {
  REPLY_VARIANT_HUMOROUS,
  REPLY_VARIANT_INSIGHTFUL,
  REPLY_PLACEHOLDER_HUMOROUS,
  REPLY_PLACEHOLDER_INSIGHTFUL,
} from "@/constants/dashboard";
import { cn } from "@/utils/cn";

const formatFollowers = (count: number): string =>
  count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toLocaleString();

export type TweetCardProps = {
  item: StoredTweet;
  isReplying: boolean;
  isLoadingReply: boolean;
  isPosting: boolean;
  onReplyClick: () => void;
  onCloseReply: () => void;
  onDelete: () => void;
  onSelectionChange: (choice: VariantChoice) => void;
  onHumorousChange: (value: string) => void;
  onInsightfulChange: (value: string) => void;
  onPostReply: () => void;
};

const TweetCard = ({
  item,
  isReplying,
  isLoadingReply,
  isPosting,
  onReplyClick,
  onCloseReply,
  onDelete,
  onSelectionChange,
  onHumorousChange,
  onInsightfulChange,
  onPostReply,
}: TweetCardProps) => {
  const displayName = item.author_name ?? item.author_username ?? "Unknown";
  const initial = displayName.charAt(0).toUpperCase();
  const timeStr = formatRelativeTime(item.created_at);
  const chosenText =
    item.selected === "humorous"
      ? (item.humorous ?? "").trim()
      : (item.insightful ?? "").trim();
  const canPost =
    (item.selected === "humorous" && (item.humorous ?? "").trim()) ||
    (item.selected === "insightful" && (item.insightful ?? "").trim());

  return (
    <article className="py-4 px-1 -mx-1 rounded-card hover:bg-border/50 transition-colors">
      <div className="flex gap-3">
        <div className="shrink-0">
          {item.author_profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.author_profile_image_url}
              alt=""
              className="w-12 h-12 rounded-full object-cover bg-border"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full bg-border flex items-center justify-center text-lg font-semibold text-foreground"
              aria-hidden
            >
              {initial}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0 text-[15px]">
            <span className="font-semibold text-foreground truncate">
              {displayName}
            </span>
            {item.author_username != null && (
              <span className="text-muted truncate">
                @{item.author_username}
              </span>
            )}
            {timeStr != null && (
              <>
                <span className="text-muted">·</span>
                <span className="text-muted">{timeStr}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[13px] text-muted">
            <span title="Tweet ID">ID: {item.id}</span>
            {item.author_followers_count != null && (
              <>
                <span>·</span>
                <span>
                  {formatFollowers(item.author_followers_count)} followers
                </span>
              </>
            )}
          </div>
          <p className="text-[15px] text-foreground whitespace-pre-wrap wrap-break-word mt-0.5 leading-snug">
            {item.text}
          </p>
          {item.public_metrics != null &&
            (item.public_metrics.reply_count != null ||
              item.public_metrics.retweet_count != null ||
              item.public_metrics.like_count != null) && (
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-muted text-[13px]">
                {item.public_metrics.reply_count != null && (
                  <span>
                    {item.public_metrics.reply_count > 0
                      ? `${item.public_metrics.reply_count} replies`
                      : "Reply"}
                  </span>
                )}
                {item.public_metrics.retweet_count != null && (
                  <span>
                    {item.public_metrics.retweet_count > 0
                      ? `${item.public_metrics.retweet_count} retweets`
                      : "Retweet"}
                  </span>
                )}
                {item.public_metrics.like_count != null && (
                  <span>
                    {item.public_metrics.like_count > 0
                      ? `${item.public_metrics.like_count} likes`
                      : "Like"}
                  </span>
                )}
              </div>
            )}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              disabled={isLoadingReply}
              onClick={onReplyClick}
              iconBefore={<Reply className="w-4 h-4 shrink-0" />}
            >
              Reply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onDelete}
              className="text-error hover:bg-error/10"
              iconBefore={<Trash2 className="w-4 h-4 shrink-0" />}
            >
              Delete
            </Button>
          </div>
          {isReplying && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Reply options</span>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={onCloseReply}
                >
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
                      href={buildTwitterReplyIntent(item.id, chosenText)}
                      external
                      iconAfter={<ExternalLink className="w-3.5 h-3.5" />}
                      className={cn(
                        !canPost && "opacity-50 pointer-events-none",
                      )}
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
          )}
        </div>
      </div>
    </article>
  );
};

export default TweetCard;

"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Repeat2, Trash2 } from "lucide-react";

import type { StoredTweet, VariantChoice } from "@/types/x/tweet";
import type { XReplyDraftUiState } from "@/types/x/reply-drafts";
import TweetActionBar from "@/components/dashboard/x/TweetActionBar";
import TweetMediaGrid from "@/components/dashboard/x/TweetMediaGrid";
import TweetReplyDraftPanel from "@/components/dashboard/x/TweetReplyDraftPanel";
import TweetDeleteModal from "@/components/dashboard/x/TweetDeleteModal";
import { formatTime, formatFollowerNumber } from "@/utils/format";
import { cn } from "@/utils/cn";
import {
  buildXPostUrl,
  X_POST_COLLAPSE_LENGTH,
} from "@/constants/x/reply-drafts";

export type TweetCardProps = {
  item: StoredTweet;
  isReplying: boolean;
  isLoadingReply: boolean;
  replyState?: XReplyDraftUiState;
  onReplyClick: () => void;
  onCloseReply: () => void;
  onDelete: () => void;
  onSelectionChange: (choice: VariantChoice) => void;
  onReplyChange: (value: string) => void;
  onToneChange: (tone: VariantChoice) => void;
  onGenerate: () => void;
};

const TweetCard = ({
  item,
  isReplying,
  isLoadingReply,
  replyState,
  onReplyClick,
  onCloseReply,
  onDelete,
  onSelectionChange,
  onReplyChange,
  onToneChange,
  onGenerate,
}: TweetCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const displayName = item.author_name ?? item.author_username ?? "Unknown";
  const initial = displayName.charAt(0).toUpperCase();
  const timeStr = formatTime(item.created_at);
  const isLongPost = (item.text?.length ?? 0) > X_POST_COLLAPSE_LENGTH;
  const showCollapsed = isLongPost && !expanded;
  const viewUrl = buildXPostUrl(item.id, item.author_username);

  const handleConfirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDelete();
  };

  return (
    <article className="relative rounded-card border border-border/80 bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        onClick={() => setDeleteConfirmOpen(true)}
        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-button border border-error/20 bg-error/10 text-error transition-colors hover:bg-error/20 focus:outline-none focus:ring-2 focus:ring-error/30"
        aria-label="Delete tweet"
        title="Delete tweet"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex gap-3">
        <div className="shrink-0">
          {item.author_profile_image_url ? (
            <Image
              src={item.author_profile_image_url}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover ring-1 ring-border/50"
            />
          ) : (
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary"
              aria-hidden
            >
              {initial}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
            <span className="font-semibold text-foreground">{displayName}</span>
            {item.author_username != null && (
              <span className="text-sm text-muted">
                @{item.author_username}
              </span>
            )}

            {timeStr != null && (
              <span className="text-sm text-muted">· {timeStr}</span>
            )}
          </div>

          {(item.author_followers_count != null || item.id) && (
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
              {item.author_followers_count != null && (
                <span>
                  {formatFollowerNumber(item.author_followers_count)} followers
                </span>
              )}

              <span className="font-mono" title="Tweet ID">
                {item.id}
              </span>
            </div>
          )}

          <div className="mt-2">
            <p
              className={cn(
                "text-[15px] text-foreground leading-snug whitespace-pre-wrap wrap-break-word",
                showCollapsed && "line-clamp-4",
              )}
            >
              {item.text}
            </p>

            {isLongPost && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-0.5 text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 rounded"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          <TweetMediaGrid media={item.media ?? []} />

          {item.public_metrics != null &&
            (item.public_metrics.reply_count != null ||
              item.public_metrics.retweet_count != null ||
              item.public_metrics.like_count != null) && (
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
                {item.public_metrics.reply_count != null && (
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {item.public_metrics.reply_count}
                  </span>
                )}
                {item.public_metrics.retweet_count != null && (
                  <span className="inline-flex items-center gap-1">
                    <Repeat2 className="h-3.5 w-3.5" />
                    {item.public_metrics.retweet_count}
                  </span>
                )}
                {item.public_metrics.like_count != null && (
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {item.public_metrics.like_count}
                  </span>
                )}
              </div>
            )}

          <TweetActionBar
            viewUrl={viewUrl}
            isLoadingReply={isLoadingReply}
            onReplyClick={onReplyClick}
          />

          <TweetReplyDraftPanel
            item={item}
            isReplying={isReplying}
            isLoadingReply={isLoadingReply}
            analysisTone={replyState?.analysisTone}
            analysisIntent={replyState?.analysisIntent}
            analysisLoading={replyState?.analysisLoading}
            analysisError={replyState?.analysisError}
            analysisTopics={replyState?.analysisTopics}
            validation={replyState?.validation}
            validationLoading={replyState?.validationLoading}
            onCloseReply={onCloseReply}
            onSelectionChange={onSelectionChange}
            onToneChange={onToneChange}
            onReplyChange={onReplyChange}
            onGenerate={onGenerate}
          />
        </div>
      </div>

      <TweetDeleteModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </article>
  );
};

export default TweetCard;

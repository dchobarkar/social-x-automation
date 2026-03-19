"use client";

import { useLayoutEffect, useRef, useState } from "react";
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
import { buildXPostUrl } from "@/constants/x/reply-drafts";

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

const TweetAuthorAvatar = ({
  profileImageUrl,
  initial,
}: {
  profileImageUrl?: string;
  initial: string;
}) => {
  if (profileImageUrl) {
    return (
      <Image
        src={profileImageUrl}
        alt=""
        width={44}
        height={44}
        unoptimized
        className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
      />
    );
  }

  return (
    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary"
      aria-hidden
    >
      {initial}
    </div>
  );
};

const TweetAuthorMeta = ({
  displayName,
  username,
  timeStr,
  followersCount,
  id,
}: {
  displayName: string;
  username?: string;
  timeStr?: string | null;
  followersCount?: number;
  id: string;
}) => (
  <>
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
      <span className="font-semibold text-foreground">{displayName}</span>
      {username != null && (
        <span className="rounded-full bg-primary/5 px-2 py-0.5 text-sm text-primary">
          @{username}
        </span>
      )}

      {timeStr != null && (
        <span className="text-sm text-muted">· {timeStr}</span>
      )}
    </div>

    {(followersCount != null || id) && (
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {followersCount != null && (
          <span className="rounded-full border border-border/70 bg-surface-strong px-2.5 py-1 text-muted">
            {formatFollowerNumber(followersCount)} followers
          </span>
        )}

        <span
          className="rounded-full border border-border/70 bg-surface-strong px-2.5 py-1 font-mono text-muted"
          title="Tweet ID"
        >
          {id}
        </span>
      </div>
    )}
  </>
);

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
  const [hasCollapsedOverflow, setHasCollapsedOverflow] = useState(false);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const displayName = item.author_name ?? item.author_username ?? "Unknown";
  const initial = displayName.charAt(0).toUpperCase();
  const timeStr = formatTime(item.created_at);
  const viewUrl = buildXPostUrl(item.id, item.author_username);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) return;

    const measureOverflow = () => {
      setHasCollapsedOverflow(element.scrollHeight > element.clientHeight + 1);
    };

    const frameId = window.requestAnimationFrame(measureOverflow);

    const observer = new ResizeObserver(measureOverflow);
    observer.observe(element);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [item.text, expanded]);

  const handleConfirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDelete();
  };

  return (
    <article className="relative rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-(--shadow-card) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-soft) sm:p-5">
      <button
        type="button"
        onClick={() => setDeleteConfirmOpen(true)}
        className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-button border border-error/20 bg-white text-error transition-colors hover:bg-error/10 focus:outline-none focus:ring-2 focus:ring-error/30"
        aria-label="Delete tweet"
        title="Delete tweet"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="shrink-0 sm:pt-0.5">
          <TweetAuthorAvatar
            profileImageUrl={item.author_profile_image_url}
            initial={initial}
          />
        </div>

        <div className="min-w-0 flex-1">
          <TweetAuthorMeta
            displayName={displayName}
            username={item.author_username}
            timeStr={timeStr}
            followersCount={item.author_followers_count}
            id={item.id}
          />

          <div className="mt-3">
            <p
              ref={textRef}
              className={cn(
                "text-[15px] leading-7 text-foreground whitespace-pre-wrap wrap-break-word",
                !expanded && "tweet-card-text-collapsed",
              )}
            >
              {item.text}
            </p>

            {hasCollapsedOverflow && (
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="mt-1 rounded text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1"
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
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
                {item.public_metrics.reply_count != null && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface-strong px-2.5 py-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {item.public_metrics.reply_count}
                  </span>
                )}
                {item.public_metrics.retweet_count != null && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface-strong px-2.5 py-1">
                    <Repeat2 className="h-3.5 w-3.5" />
                    {item.public_metrics.retweet_count}
                  </span>
                )}
                {item.public_metrics.like_count != null && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface-strong px-2.5 py-1">
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

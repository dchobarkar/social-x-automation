"use client";

import { useState } from "react";
import {
  Reply,
  Trash2,
  ExternalLink,
  MessageCircle,
  Heart,
  Repeat2,
} from "lucide-react";

import type { StoredTweet, VariantChoice, TweetMedia } from "@/types/x/tweet";
import Button from "@/components/ui/Button";
import Textarea from "@/components/form/Textarea";
import Modal from "@/components/ui/Modal";
import { formatTime } from "@/utils/format";
import { formatFollowerNumber } from "@/utils/format";
import {
  buildTwitterReplyIntent,
  buildTweetViewUrl,
} from "@/constants/dashboard";
import {
  REPLY_VARIANT_HUMOROUS,
  REPLY_VARIANT_INSIGHTFUL,
  REPLY_PLACEHOLDER_HUMOROUS,
  REPLY_PLACEHOLDER_INSIGHTFUL,
} from "@/constants/dashboard";
import { cn } from "@/utils/cn";

const POST_COLLAPSE_LENGTH = 200;

const MediaViewerContent = ({ media }: { media: TweetMedia }) => {
  const imageUrl =
    media.type === "photo" && media.url
      ? media.url
      : (media.preview_image_url ?? media.url);
  const isVideoOrGif = media.type === "video" || media.type === "animated_gif";
  const videoUrl = media.url;

  if (isVideoOrGif && videoUrl) {
    return (
      <div className="flex max-h-[80vh] w-full items-center justify-center bg-black">
        <video
          src={videoUrl}
          controls
          autoPlay
          loop={media.type === "animated_gif"}
          muted={media.type === "animated_gif"}
          playsInline
          className="max-h-[80vh] w-full object-contain"
        />
      </div>
    );
  }

  if (imageUrl) {
    return (
      <div className="flex max-h-[80vh] w-full items-center justify-center bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          className="max-h-[80vh] max-w-full object-contain"
        />
      </div>
    );
  }

  return null;
};

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
  const [expanded, setExpanded] = useState(false);
  const [viewingMedia, setViewingMedia] = useState<TweetMedia | null>(null);
  const displayName = item.author_name ?? item.author_username ?? "Unknown";
  const initial = displayName.charAt(0).toUpperCase();
  const timeStr = formatTime(item.created_at);
  const chosenText =
    item.selected === "humorous"
      ? (item.humorous ?? "").trim()
      : (item.insightful ?? "").trim();
  const canPost =
    (item.selected === "humorous" && (item.humorous ?? "").trim()) ||
    (item.selected === "insightful" && (item.insightful ?? "").trim());
  const isLongPost = (item.text?.length ?? 0) > POST_COLLAPSE_LENGTH;
  const showCollapsed = isLongPost && !expanded;
  const viewUrl = buildTweetViewUrl(item.id, item.author_username);

  return (
    <article className="rounded-card border border-border/80 bg-background p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex gap-3">
        <div className="shrink-0">
          {item.author_profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.author_profile_image_url}
              alt=""
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
                onClick={() => setExpanded((e) => !e)}
                className="mt-0.5 text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 rounded"
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </div>
          {item.media != null && item.media.length > 0 && (
            <>
              <div
                className={cn(
                  "mt-3 overflow-hidden rounded-2xl border border-border/60",
                  item.media.length === 1 && "max-w-full",
                  item.media.length === 2 && "grid grid-cols-2 gap-0.5",
                  item.media.length === 3 && "grid grid-cols-2 gap-0.5",
                  item.media.length >= 4 && "grid grid-cols-2 gap-0.5",
                )}
              >
                {item.media.map((m, idx) => {
                  const src =
                    m.type === "photo" && m.url
                      ? m.url
                      : (m.preview_image_url ?? m.url);
                  if (!src) return null;
                  const spanFirst = item.media!.length === 3 && idx === 0;
                  return (
                    <button
                      type="button"
                      key={`${item.id}-${m.url ?? m.preview_image_url ?? idx}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setViewingMedia(m);
                      }}
                      className={cn(
                        "relative block aspect-video min-h-30 w-full bg-muted cursor-pointer border-0 p-0 text-left",
                        spanFirst && "col-span-2",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {(m.type === "video" || m.type === "animated_gif") && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl pointer-events-none">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-foreground">
                            <span className="ml-0.5 h-0 w-0 border-y-8 border-l-12 border-y-transparent border-l-current" />
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <Modal
                open={viewingMedia != null}
                onClose={() => setViewingMedia(null)}
                variant="centered"
                className="p-0! pt-10! max-w-4xl w-full max-h-[90vh] overflow-hidden"
                ariaLabel="View media"
              >
                {viewingMedia != null && (
                  <MediaViewerContent media={viewingMedia} />
                )}
              </Modal>
            </>
          )}
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              href={viewUrl}
              external
              iconBefore={<ExternalLink className="h-4 w-4 shrink-0" />}
            >
              View on X
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              disabled={isLoadingReply}
              onClick={onReplyClick}
              iconBefore={<Reply className="h-4 w-4 shrink-0" />}
            >
              Reply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onDelete}
              className="text-error hover:bg-error/10"
              iconBefore={<Trash2 className="h-4 w-4 shrink-0" />}
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

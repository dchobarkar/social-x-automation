"use client";

import type { StoredTweet, VariantChoice } from "@/types/tweet";
import Card from "@/components/ui/Card";
import TweetCard from "@/components/dashboard/TweetCard";

export type TweetListSectionProps = {
  items: StoredTweet[];
  title: string;
  description: string;
  loadingReplyForId: string | null;
  replyingToId: string | null;
  postingForId: string | null;
  onReplyClick: (item: StoredTweet) => void;
  onCloseReply: () => void;
  onDelete: (id: string) => void;
  onSelectionChange: (id: string, choice: VariantChoice) => void;
  onHumorousChange: (id: string, value: string) => void;
  onInsightfulChange: (id: string, value: string) => void;
  onPostReply: (id: string) => void;
  className?: string;
};

const TweetListSection = ({
  items,
  title,
  description,
  loadingReplyForId,
  replyingToId,
  postingForId,
  onReplyClick,
  onCloseReply,
  onDelete,
  onSelectionChange,
  onHumorousChange,
  onInsightfulChange,
  onPostReply,
  className,
}: TweetListSectionProps) => {
  if (items.length === 0) return null;

  return (
    <Card title={title} className={className}>
      <p className="text-sm text-muted mb-5">{description}</p>
      <div className="space-y-4">
        {items.map((item) => (
          <TweetCard
            key={item.id}
            item={item}
            isReplying={replyingToId === item.id}
            isLoadingReply={loadingReplyForId === item.id}
            isPosting={postingForId === item.id}
            onReplyClick={() => onReplyClick(item)}
            onCloseReply={onCloseReply}
            onDelete={() => onDelete(item.id)}
            onSelectionChange={(choice) => onSelectionChange(item.id, choice)}
            onHumorousChange={(value) => onHumorousChange(item.id, value)}
            onInsightfulChange={(value) => onInsightfulChange(item.id, value)}
            onPostReply={() => onPostReply(item.id)}
          />
        ))}
      </div>
    </Card>
  );
};

export default TweetListSection;

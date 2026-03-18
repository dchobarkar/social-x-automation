import type { StoredTweet, VariantChoice } from "@/types/x/tweet";
import type { XReplyDraftUiState } from "@/types/x/reply-drafts";
import Card from "@/components/ui/Card";
import TweetCard from "./TweetCard";

export type TweetListSectionProps = {
  items: StoredTweet[];
  title: string;
  loadingReplyForId: string | null;
  replyingToId: string | null;
  replyUiByTweetId: Record<string, XReplyDraftUiState>;
  onReplyClick: (item: StoredTweet) => void;
  onCloseReply: () => void;
  onDelete: (id: string) => void;
  onSelectionChange: (id: string, choice: VariantChoice) => void;
  onToneChange: (id: string, tone: VariantChoice) => void;
  onReplyChange: (id: string, value: string) => void;
  onGenerate: (id: string) => void;
  className?: string;
};

const TweetListSection = ({
  items,
  title,
  loadingReplyForId,
  replyingToId,
  replyUiByTweetId,
  onReplyClick,
  onCloseReply,
  onDelete,
  onSelectionChange,
  onToneChange,
  onReplyChange,
  onGenerate,
  className,
}: TweetListSectionProps) => {
  if (items.length === 0) return null;

  return (
    <Card title={title} className={className}>
      <div className="space-y-4">
        {items.map((item) => (
          <TweetCard
            key={item.id}
            item={item}
            replyState={replyUiByTweetId[item.id]}
            isReplying={replyingToId === item.id}
            isLoadingReply={loadingReplyForId === item.id}
            onReplyClick={() => onReplyClick(item)}
            onCloseReply={onCloseReply}
            onDelete={() => onDelete(item.id)}
            onSelectionChange={(choice) => onSelectionChange(item.id, choice)}
            onToneChange={(tone) => onToneChange(item.id, tone)}
            onReplyChange={(value) => onReplyChange(item.id, value)}
            onGenerate={() => onGenerate(item.id)}
          />
        ))}
      </div>
    </Card>
  );
};

export default TweetListSection;

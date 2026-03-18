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
  return (
    <Card
      title={title}
      description={
        items.length > 0
          ? `${items.length} saved post${items.length === 1 ? "" : "s"} ready for review`
          : "Load your feed to start reviewing posts and generating replies."
      }
      className={className}
    >
      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface-strong p-8 text-center">
          <p className="text-base font-medium text-foreground">
            Nothing loaded yet
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted">
            Use the filters above and pull a fresh batch from your X home feed.
            Once posts are loaded, you will be able to scan them, pick a tone,
            generate drafts, and jump into X only for the final post step.
          </p>
        </div>
      ) : (
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
      )}
    </Card>
  );
};

export default TweetListSection;

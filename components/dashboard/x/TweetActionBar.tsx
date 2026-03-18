import { Reply, ExternalLink } from "lucide-react";

import Button from "@/components/ui/Button";

export type TweetActionBarProps = {
  viewUrl: string;
  isLoadingReply: boolean;
  onReplyClick: () => void;
};

const TweetActionBar = ({
  viewUrl,
  isLoadingReply,
  onReplyClick,
}: TweetActionBarProps) => {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        type="button"
        href={viewUrl}
        external
        iconBefore={<ExternalLink className="h-4 w-4 shrink-0" />}
      >
        View on X
      </Button>

      <Button
        variant="outline"
        size="sm"
        type="button"
        disabled={isLoadingReply}
        onClick={onReplyClick}
        iconBefore={<Reply className="h-4 w-4 shrink-0" />}
      >
        {isLoadingReply ? "Working…" : "Draft reply"}
      </Button>
    </div>
  );
};

export default TweetActionBar;

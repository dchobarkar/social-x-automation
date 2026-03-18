import { X } from "lucide-react";

import type { StoredTweet, VariantChoice } from "@/types/x/tweet";
import type { ReplyTone, ReplyValidation } from "@/types/ai/replies";
import Button from "@/components/ui/Button";
import Textarea from "@/components/form/Textarea";
import {
  buildXReplyIntentUrl,
  X_REPLY_DRAFT_PLACEHOLDERS,
  X_REPLY_DRAFT_TONE_LABELS,
} from "@/constants/x/reply-drafts";
import { cn } from "@/utils/cn";

export type TweetReplyDraftPanelProps = {
  item: StoredTweet;
  isReplying: boolean;
  isLoadingReply: boolean;
  analysisTone?: string;
  analysisIntent?: string;
  analysisLoading?: boolean;
  analysisError?: string;
  analysisTopics?: string[];
  validation?: ReplyValidation;
  validationLoading?: boolean;
  onCloseReply: () => void;
  onSelectionChange: (choice: VariantChoice) => void;
  onToneChange: (tone: ReplyTone) => void;
  onReplyChange: (value: string) => void;
  onGenerate: () => void;
};

const TweetReplyDraftPanel = ({
  item,
  isReplying,
  isLoadingReply,
  analysisTone,
  analysisIntent,
  analysisLoading,
  analysisError,
  analysisTopics,
  validation,
  validationLoading,
  onCloseReply,
  onSelectionChange,
  onToneChange,
  onReplyChange,
  onGenerate,
}: TweetReplyDraftPanelProps) => {
  if (!isReplying) return null;

  const selectedText = (() => {
    const value = item[item.selected];
    return (value ?? "").trim();
  })();
  const hasReplyText = Boolean(selectedText);
  const canOpenInX = hasReplyText && (validation?.isSafe ?? true);

  const topicPreview = (analysisTopics ?? []).slice(0, 5).join(", ");

  const tones: { tone: ReplyTone; label: string }[] = (
    Object.entries(X_REPLY_DRAFT_TONE_LABELS) as [ReplyTone, string][]
  ).map(([tone, label]) => ({ tone, label }));

  return (
    <div className="mt-5 space-y-4 rounded-[28px] border border-primary/10 bg-primary/5 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/75">
            Draft workspace
          </p>
          <span className="text-sm font-medium">
            Pick a tone and refine the reply
          </span>
        </div>

        <Button variant="ghost" size="sm" type="button" onClick={onCloseReply}>
          <X />
        </Button>
      </div>

      <div className="rounded-3xl border border-white/70 bg-white/80 p-3 text-xs text-muted">
        {analysisLoading ? (
          <span>Analyzing post tone…</span>
        ) : analysisTone || analysisIntent ? (
          <span>
            Analyzed as{" "}
            {analysisTone ? analysisTone.toLowerCase() : "unknown tone"}
            {analysisIntent ? ` • ${analysisIntent.toLowerCase()}` : ""}
          </span>
        ) : (
          <span>Post tone not analyzed.</span>
        )}

        {analysisError && (
          <span className="ml-2 text-error">({analysisError})</span>
        )}
        {analysisTopics && analysisTopics.length > 0 && (
          <span className="ml-2">
            • Topics: {topicPreview}
            {analysisTopics.length > 5 ? "…" : ""}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Reply tone
          </p>
          <div className="flex flex-wrap gap-2">
            {tones.map(({ tone, label }) => (
              <label
                key={tone}
                htmlFor={`${tone}-${item.id}`}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm",
                  item.selected === tone
                    ? "border-primary bg-primary text-white shadow-[0_10px_24px_rgba(22,93,245,0.18)]"
                    : "border-border bg-white text-foreground hover:border-primary/30 hover:bg-primary/5",
                )}
              >
                <input
                  id={`${tone}-${item.id}`}
                  type="radio"
                  name={`choice-${item.id}`}
                  checked={item.selected === tone}
                  onChange={() => {
                    onSelectionChange(tone);
                    onToneChange(tone);
                  }}
                  className="sr-only"
                />
                <span className="font-medium">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <Textarea
          rows={3}
          value={selectedText}
          onChange={(e) => onReplyChange(e.target.value)}
          placeholder={X_REPLY_DRAFT_PLACEHOLDERS[item.selected]}
          name={`reply-${item.id}`}
          className="rounded-[22px]"
          description="Edit the draft before you open X. Nothing is posted automatically."
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          type="button"
          variant="primary"
          onClick={onGenerate}
          disabled={isLoadingReply}
        >
          {isLoadingReply ? "Generating…" : "Generate with AI"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          href={buildXReplyIntentUrl(item.id, selectedText)}
          external
          className={cn(!canOpenInX && "opacity-50 pointer-events-none")}
        >
          Open in X to post
        </Button>
      </div>

      {validation ? (
        <div className="mt-2 rounded-3xl border border-border/60 bg-white/80 p-3 text-xs">
          <div>
            Validation: {validation.isSafe ? "Safe" : "Not safe"} • Score{" "}
            {validation.score}
          </div>
          {validation.issues && validation.issues.length > 0 && (
            <div className="mt-1">Issues: {validation.issues.join(" • ")}</div>
          )}
        </div>
      ) : validationLoading ? (
        <div className="mt-2 text-xs text-muted">Validating…</div>
      ) : null}

      <p className="mt-1.5 text-xs text-muted">
        Generated replies stay local until you open X to post them manually.
      </p>
    </div>
  );
};

export default TweetReplyDraftPanel;

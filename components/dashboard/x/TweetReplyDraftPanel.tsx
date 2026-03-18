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
    <div className="mt-4 pt-4 border-t border-border space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Reply options</span>

        <Button variant="ghost" size="sm" type="button" onClick={onCloseReply}>
          <X />
        </Button>
      </div>

      <div className="text-xs text-muted">
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
        <div className="flex flex-wrap gap-3">
          {tones.map(({ tone, label }) => (
            <label
              key={tone}
              htmlFor={`${tone}-${item.id}`}
              className="inline-flex items-center gap-2 text-sm"
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
                className="rounded-full border-border text-primary focus:ring-primary/30"
              />
              <span className="font-medium">{label}</span>
            </label>
          ))}
        </div>

        <Textarea
          rows={3}
          value={selectedText}
          onChange={(e) => onReplyChange(e.target.value)}
          placeholder={X_REPLY_DRAFT_PLACEHOLDERS[item.selected]}
          name={`reply-${item.id}`}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          type="button"
          variant="secondary"
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
        <div className="mt-2 rounded-card border border-border/60 bg-muted/40 p-3 text-xs">
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

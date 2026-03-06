"use client";

import type { FlashMessage } from "@/types/ui";
import { cn } from "@/utils/cn";

export type FlashMessageBarProps = {
  message: FlashMessage | null;
  className?: string;
};

const FlashMessageBar = ({ message, className }: FlashMessageBarProps) => {
  if (!message?.text) return null;
  return (
    <div
      role="alert"
      className={cn(
        "rounded-card p-4",
        message.type === "success"
          ? "bg-success/10 text-success"
          : "bg-error/10 text-error",
        className,
      )}
    >
      {message.text}
    </div>
  );
};

export default FlashMessageBar;

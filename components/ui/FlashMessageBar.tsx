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
        "rounded-card border p-4 shadow-(--shadow-card)",
        message.type === "success"
          ? "border-success/20 bg-success/10 text-success"
          : "border-error/20 bg-error/10 text-error",
        className,
      )}
    >
      {message.text}
    </div>
  );
};

export default FlashMessageBar;

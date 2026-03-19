"use client";

import type { ReactNode } from "react";
import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { cn } from "@/utils/cn";

type ModalVariant = "default" | "centered" | "fullscreen";

export type ModalProps = {
  /** Whether the modal is open. */
  open: boolean;
  /** Called when the modal should close (overlay click, Escape, or close icon). */
  onClose: () => void;
  /** Modal content. */
  children?: ReactNode;
  /** Visual style of the content box. */
  variant?: ModalVariant;
  /** Close when clicking the overlay. Default true. */
  closeOnOverlayClick?: boolean;
  /** Close when pressing Escape. Default true. */
  closeOnEscape?: boolean;
  /** Accessible label for the modal (e.g. for aria-labelledby or aria-label). */
  ariaLabel?: string;
  /** Optional class for the content container. */
  className?: string;
};

const variantClasses: Record<ModalVariant, string> = {
  default: "p-4 max-w-lg w-full max-h-[90vh] overflow-auto rounded-card",
  centered: "p-6 max-w-md w-full max-h-[85vh] overflow-auto rounded-card mx-4",
  fullscreen: "inset-0 max-w-none max-h-none rounded-none",
};

const Modal = ({
  open,
  onClose,
  children,
  variant = "default",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  ariaLabel,
  className = "",
}: ModalProps) => {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") onClose();
    },
    [closeOnEscape, onClose],
  );

  useEffect(() => {
    if (!open) return;

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, handleEscape]);

  if (!open || typeof document === "undefined") return null;

  const contentClasses = cn(
    "bg-background text-foreground border border-border shadow-sm",
    variantClasses[variant],
    className,
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      {/* Overlay */}
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        className="absolute inset-0 bg-foreground/50 focus:outline-none"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      {/* Content */}
      <div
        className={cn("relative", contentClasses)}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 rounded-button p-1.5 text-muted hover:bg-border hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pt-8">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;

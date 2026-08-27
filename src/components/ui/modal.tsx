"use client";

import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FocusTrap } from "@/components/ui/focus-trap";
import { cn } from "@/lib/utils";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  triggerRef?: RefObject<HTMLElement | null>;
  className?: string;
};

export function Modal({
  open,
  onClose,
  title,
  children,
  triggerRef,
  className,
}: ModalProps) {
  const titleId = useId();
  const fallbackTriggerRef = useRef<HTMLElement | null>(null);
  const returnRef = triggerRef ?? fallbackTriggerRef;

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <FocusTrap active={open} onEscape={onClose} returnFocusRef={returnRef}>
      <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          aria-label="Close dialog"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={cn(
            "relative z-10 w-full max-w-md rounded-lg border bg-background p-4 shadow-lg",
            className
          )}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2 id={titleId} className="text-base font-semibold">
              {title}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
          {children}
        </div>
      </div>
    </FocusTrap>
  );
}

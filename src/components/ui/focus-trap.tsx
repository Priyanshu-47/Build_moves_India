"use client";

import { useEffect, useRef, type ReactNode, type RefObject } from "react";

import {
  focusFirstFocusable,
  getFocusableElements,
} from "@/lib/a11y/focus";

type FocusTrapProps = {
  active: boolean;
  children: ReactNode;
  returnFocusRef?: RefObject<HTMLElement | null>;
  onEscape?: () => void;
  className?: string;
};

export function FocusTrap({
  active,
  children,
  returnFocusRef,
  onEscape,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    if (container) {
      focusFirstFocusable(container);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onEscape?.();
        return;
      }

      if (event.key !== "Tab" || !containerRef.current) return;

      const focusable = getFocusableElements(containerRef.current);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const returnTarget =
        returnFocusRef?.current ?? previouslyFocusedRef.current;
      returnTarget?.focus();
    };
  }, [active, onEscape, returnFocusRef]);

  if (!active) return null;

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

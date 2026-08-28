"use client";

import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

type SwipeToDismissProps = {
  onDismiss: () => void;
  children: React.ReactNode;
  className?: string;
};

export function SwipeToDismiss({ onDismiss, children, className }: SwipeToDismissProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const startX = useRef(0);
  const isDragging = useRef(false);

  function handleTouchStart(event: React.TouchEvent) {
    startX.current = event.touches[0].clientX;
    isDragging.current = true;
  }

  function handleTouchMove(event: React.TouchEvent) {
    if (!isDragging.current) return;
    const delta = event.touches[0].clientX - startX.current;
    if (delta > 0) setOffsetX(delta);
  }

  function handleTouchEnd() {
    isDragging.current = false;
    if (offsetX > 120) {
      setDismissing(true);
      setTimeout(onDismiss, 200);
    } else {
      setOffsetX(0);
    }
  }

  return (
    <div
      className={cn(
        "transition-transform duration-200 ease-out",
        dismissing && "opacity-0",
        className
      )}
      style={{ transform: `translateX(${offsetX}px)` }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}

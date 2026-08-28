"use client";

import { useCallback, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";

import { cn } from "@/lib/utils";

type PullToRefreshProps = {
  onRefresh: () => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
};

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = event.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (startY.current === 0 || refreshing) return;
    const delta = event.touches[0].clientY - startY.current;
    if (delta > 0 && window.scrollY === 0) {
      pullDistance.current = Math.min(delta, 80);
      setPulling(pullDistance.current > 40);
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pulling && !refreshing) {
      setRefreshing(true);
      setPulling(false);
      await onRefresh();
      setRefreshing(false);
    }
    startY.current = 0;
    pullDistance.current = 0;
    setPulling(false);
  }, [pulling, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={cn(
          "absolute inset-x-0 -top-10 flex items-center justify-center transition-opacity duration-200",
          pulling || refreshing ? "opacity-100" : "opacity-0"
        )}
        aria-hidden="true"
      >
        <RefreshCw
          className={cn("size-5 text-primary", refreshing && "animate-spin")}
        />
      </div>
      {children}
    </div>
  );
}

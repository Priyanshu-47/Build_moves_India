"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  Calendar,
  MapPin,
  Package,
  Play,
  FileText,
} from "lucide-react";

import { MatchScore } from "@/components/MatchScore";
import { BidOpportunity, MatchResult } from "@/lib/schemas";
import { getToday } from "@/lib/rules/msme-rights";
import { cn } from "@/lib/utils";

type BidCardProps = {
  bid: BidOpportunity;
  match: MatchResult;
  className?: string;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntilDeadline(deadline: string): number {
  const end = new Date(`${deadline}T23:59:59`);
  const now = new Date(`${getToday()}T12:00:00`);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function matchBorderColor(score: number): string {
  if (score > 80) return "border-l-emerald-500";
  if (score >= 60) return "border-l-amber-500";
  return "border-l-rose-500";
}

export function BidCard({ bid, match, className }: BidCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const daysLeft = daysUntilDeadline(bid.deadline);
  const isLocal =
    bid.location.state.toLowerCase().includes("rajasthan") ||
    bid.location.city.toLowerCase().includes("jaipur") ||
    bid.location.state.toLowerCase().includes("uttar pradesh");

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition hover:shadow-md",
        "border-l-[3px]",
        matchBorderColor(match.matchScore),
        className
      )}
    >
      <div className="p-5 sm:p-6">
        <div className="flex gap-4">
          <div className="min-w-0 flex-1">
            <div className="pr-14 sm:pr-20">
              <Link
                href={`/opportunities/${bid.id}`}
                className="text-base font-bold leading-snug text-foreground outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring sm:text-lg"
              >
                {bid.title}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">{bid.department}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {bid.status === "closing_soon" && (
                <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800">
                  Closing Soon
                </span>
              )}
              {bid.mseReserved && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800">
                  MSE Reserved
                </span>
              )}
              {isLocal && (
                <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-800">
                  Local Delivery
                </span>
              )}
              {bid.status === "open" && daysLeft > 7 && (
                <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700">
                  Open
                </span>
              )}
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {bid.location.city}, {bid.location.state}
            </p>

            {/* Qty · Value · Deadline */}
            <div className="mt-4 grid gap-3 sm:grid-cols-3 sm:items-end">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Package className="size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {bid.quantity.toLocaleString("en-IN")} {bid.unit}
                </span>
              </div>
              <div>
                <p className="text-base font-bold tabular-nums text-foreground">
                  {formatCurrency(bid.estimatedValue)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Estimated Value</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {formatDeadline(bid.deadline)}
                  {daysLeft > 0 && (
                    <span className="text-xs font-semibold text-amber-600">
                      ({daysLeft}d left)
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Deadline</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href={`/simulate?bid=${bid.id}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                <Play className="size-3.5" aria-hidden="true" />
                Simulate
              </Link>
              <Link
                href={`/opportunities/${bid.id}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
              >
                <FileText className="size-3.5" aria-hidden="true" />
                Bid Prep
              </Link>
            </div>
          </div>

          {/* Match + bookmark */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            <button
              type="button"
              onClick={() => setBookmarked((v) => !v)}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground",
                bookmarked && "text-primary"
              )}
              aria-label={bookmarked ? "Remove bookmark" : "Bookmark tender"}
            >
              <Bookmark
                className={cn("size-4", bookmarked && "fill-primary")}
                aria-hidden="true"
              />
            </button>
            <MatchScore score={match.matchScore} dimensions={match.dimensions} />
          </div>
        </div>
      </div>
    </article>
  );
}

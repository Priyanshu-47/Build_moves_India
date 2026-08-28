import Link from "next/link";
import { Calendar, IndianRupee, MapPin, Package, Play, FileText } from "lucide-react";

import { MatchScore } from "@/components/MatchScore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  if (score > 80) return "border-l-green-500";
  if (score >= 60) return "border-l-amber-500";
  return "border-l-red-500";
}

function statusLabel(status: BidOpportunity["status"]): string {
  return status === "closing_soon" ? "Closing Soon" : "Open";
}

export function BidCard({ bid, match, className }: BidCardProps) {
  const daysLeft = daysUntilDeadline(bid.deadline);
  const isLocal = bid.location.state.toLowerCase().includes("rajasthan") ||
    bid.location.city.toLowerCase().includes("jaipur");

  return (
    <Card
      className={cn(
        "border-l-4 transition-all duration-200 hover:scale-[1.01] hover:shadow-md",
        matchBorderColor(match.matchScore),
        className
      )}
    >
      <CardContent className="relative flex gap-3 pt-4 sm:gap-4">
        <div className="absolute top-3 right-3">
          <MatchScore
            score={match.matchScore}
            dimensions={match.dimensions}
            className="shrink-0"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3 pr-16">
          <div className="space-y-2">
            <div className="flex flex-wrap items-start gap-2">
              <Link
                href={`/opportunities/${bid.id}`}
                className="text-base font-bold leading-snug break-words outline-none hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
              >
                {bid.title}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">{bid.department}</p>

            <div className="flex flex-wrap gap-1.5">
              {bid.status === "closing_soon" && (
                <Badge variant="destructive">Closing Soon</Badge>
              )}
              {bid.mseReserved && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                  MSE Reserved
                </Badge>
              )}
              {daysLeft <= 7 && daysLeft > 0 && (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                </Badge>
              )}
              {isLocal && (
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  Local Delivery
                </Badge>
              )}
              {bid.status === "open" && daysLeft > 7 && (
                <Badge variant="secondary">{statusLabel(bid.status)}</Badge>
              )}
            </div>

            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              {bid.location.city}, {bid.location.state}
            </p>
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <p className="flex items-center gap-1.5">
              <Package className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              {bid.quantity.toLocaleString("en-IN")} {bid.unit}
            </p>
            <p className="flex items-center gap-1.5 font-semibold text-foreground">
              <IndianRupee className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
              {formatCurrency(bid.estimatedValue)}
            </p>
            <p className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>
                {formatDeadline(bid.deadline)}
                {daysLeft > 0 && (
                  <span className="ml-1 text-xs text-amber-600">
                    ({daysLeft}d left)
                  </span>
                )}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={`/simulate?bid=${bid.id}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-all duration-200 hover:bg-muted"
            >
              <Play className="size-3.5" aria-hidden="true" />
              Simulate
            </Link>
            <Link
              href={`/opportunities/${bid.id}`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg gradient-cta px-3 text-sm font-medium text-white"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              Bid Prep
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

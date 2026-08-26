import Link from "next/link";
import { Calendar, IndianRupee, MapPin, Package } from "lucide-react";

import { MatchScore } from "@/components/MatchScore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BidOpportunity, MatchResult } from "@/lib/schemas";
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

function statusLabel(status: BidOpportunity["status"]): string {
  return status === "closing_soon" ? "Closing Soon" : "Open";
}

export function BidCard({ bid, match, className }: BidCardProps) {
  return (
    <Card className={cn("transition-colors hover:bg-muted/30", className)}>
      <CardContent className="flex gap-3 pt-4 sm:gap-4">
        <Link
          href={`/opportunities/${bid.id}`}
          className="min-w-0 flex-1 space-y-3 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-start gap-2">
              <h2 className="text-base font-semibold leading-snug break-words">
                {bid.title}
              </h2>
              <Badge
                variant={bid.status === "closing_soon" ? "destructive" : "secondary"}
              >
                {statusLabel(bid.status)}
              </Badge>
              {bid.mseReserved && <Badge variant="outline">MSE Reserved</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{bid.department}</p>
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
            <p className="flex items-center gap-1.5">
              <IndianRupee className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              {formatCurrency(bid.estimatedValue)}
            </p>
            <p className="flex items-center gap-1.5">
              <Calendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              {formatDeadline(bid.deadline)}
            </p>
          </div>
        </Link>

        <MatchScore
          score={match.matchScore}
          dimensions={match.dimensions}
          className="shrink-0"
        />
      </CardContent>
    </Card>
  );
}

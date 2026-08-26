"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Trophy } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SAMPLE_AUCTION,
  calculateFloorPrice,
  simulateAuction,
} from "@/lib/rules/reverse-auction";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const DEFAULT_FLOOR = calculateFloorPrice({
  material: 2800,
  labor: 600,
  overhead: 350,
  delivery: 150,
  marginPercent: 5,
}).minimum;

export function ReverseAuctionSimulator() {
  const [myBid, setMyBid] = useState("3900");

  const bidPerUnit = Number.parseFloat(myBid) || 0;

  const simulation = useMemo(
    () =>
      simulateAuction(
        bidPerUnit,
        SAMPLE_AUCTION.competitors,
        DEFAULT_FLOOR,
        SAMPLE_AUCTION.quantity
      ),
    [bidPerUnit]
  );

  const outcomeVariant = simulation.winnersCurseWarning
    ? "destructive"
    : simulation.isH1
      ? "default"
      : "secondary";

  return (
    <div className="space-y-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-base">Sample scenario</CardTitle>
          <CardDescription>
            {SAMPLE_AUCTION.title} · estimated value{" "}
            {formatCurrency(SAMPLE_AUCTION.estimatedValue)} ·{" "}
            {SAMPLE_AUCTION.quantity} units
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">Current competitor bids (per unit):</p>
          <ul className="space-y-1 text-muted-foreground">
            {SAMPLE_AUCTION.competitors.map((competitor) => (
              <li key={competitor.name}>
                {competitor.name}: {formatCurrency(competitor.currentBid)}
                <span className="ml-1 text-xs">
                  (history: {competitor.pastBids.map((b) => `₹${b}`).join(" → ")})
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-1.5">
        <Label htmlFor="my-bid">Your bid per unit (₹)</Label>
        <Input
          id="my-bid"
          type="number"
          min="0"
          value={myBid}
          onChange={(e) => setMyBid(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Floor price for this scenario: {formatCurrency(DEFAULT_FLOOR)}/unit
        </p>
      </div>

      {bidPerUnit > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">Simulation result</CardTitle>
              <Badge variant={outcomeVariant}>
                Rank {simulation.rank}
                {simulation.isH1 ? " — H1" : ""}
              </Badge>
              {simulation.isH1 && (
                <Trophy className="size-4 text-amber-500" aria-hidden="true" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>{simulation.message}</p>

            <div className="grid gap-2 sm:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Total bid value:</span>{" "}
                <strong>{formatCurrency(simulation.totalValue)}</strong>
              </p>
              <p>
                <span className="text-muted-foreground">Estimated margin:</span>{" "}
                <strong
                  className={cn(
                    simulation.margin < 0 && "text-destructive",
                    simulation.margin > 0 && "text-green-700 dark:text-green-400"
                  )}
                >
                  {formatCurrency(simulation.margin)} ({simulation.marginPercent}%)
                </strong>
              </p>
            </div>

            {simulation.autoExtensionTriggered && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                Auto-extension likely — your H1 bid is within minimum decrement of the
                next competitor. Expect +15 minutes if they counter-bid.
              </p>
            )}

            {simulation.winnersCurseWarning && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  <strong>Winner&apos;s curse warning:</strong> Your bid of{" "}
                  {formatCurrency(bidPerUnit)}/unit is below the floor of{" "}
                  {formatCurrency(DEFAULT_FLOOR)}/unit. You would win but lose{" "}
                  {formatCurrency(Math.abs(simulation.margin))} on this order.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

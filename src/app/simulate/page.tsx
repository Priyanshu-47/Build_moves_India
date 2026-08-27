"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  TrendingDown,
  XCircle,
} from "lucide-react";

import bidsData from "@/data/bids.json";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmationPanel } from "@/components/ui/confirmation-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BidOpportunity, SellerProfile, parseBids } from "@/lib/schemas";
import {
  BidRecommendation,
  calculateTrueCost,
  stressTest,
} from "@/lib/rules/true-cost";
import { computeMatch } from "@/lib/rules/match";
import { getSeller } from "@/lib/store";
import { focusElementById } from "@/lib/a11y/focus";
import { cn } from "@/lib/utils";

const bids = parseBids(bidsData);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function recommendationLabel(rec: BidRecommendation): string {
  switch (rec) {
    case "strong_bid":
      return "Strong Bid";
    case "bid":
      return "Bid";
    case "caution":
      return "Proceed with Caution";
    case "walk_away":
      return "Walk Away";
  }
}

function recommendationColor(rec: BidRecommendation): string {
  switch (rec) {
    case "strong_bid":
      return "border-green-500 bg-green-50 dark:bg-green-950/30";
    case "bid":
      return "border-green-400 bg-green-50/50 dark:bg-green-950/20";
    case "caution":
      return "border-amber-500 bg-amber-50 dark:bg-amber-950/30";
    case "walk_away":
      return "border-destructive bg-destructive/10";
  }
}

export default function SimulatePage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState(bids[0]?.id ?? "");
  const [bidAmount, setBidAmount] = useState("");
  const [bidSubmitted, setBidSubmitted] = useState(false);

  useEffect(() => {
    const profile = getSeller();
    if (!profile) {
      router.replace("/setup");
      return;
    }
    setSeller(profile);
    setReady(true);
  }, [router]);

  const selectedBid = useMemo(
    () => bids.find((bid) => bid.id === selectedBidId) ?? bids[0],
    [selectedBidId]
  );

  useEffect(() => {
    if (selectedBid) {
      setBidAmount(String(selectedBid.estimatedValue));
    }
  }, [selectedBid]);

  const parsedBidAmount = Number.parseFloat(bidAmount) || selectedBid?.estimatedValue || 0;

  const analysis = useMemo(() => {
    if (!seller || !selectedBid) return null;
    return calculateTrueCost(selectedBid, seller, parsedBidAmount);
  }, [seller, selectedBid, parsedBidAmount]);

  const scenarios = useMemo(() => {
    if (!seller || !selectedBid) return [];
    return stressTest(selectedBid, seller, parsedBidAmount);
  }, [seller, selectedBid, parsedBidAmount]);

  const match = useMemo(() => {
    if (!seller || !selectedBid) return null;
    return computeMatch(seller, selectedBid);
  }, [seller, selectedBid]);

  useEffect(() => {
    if (bidSubmitted) {
      queueMicrotask(() => focusElementById("confirmation-panel"));
    }
  }, [bidSubmitted]);

  if (!ready || !seller || !selectedBid || !analysis || !match) {
    return (
      <PageShell>
        <CardSkeleton rows={8} />
      </PageShell>
    );
  }

  if (bidSubmitted) {
    return (
      <PageShell className="space-y-6">
        <ConfirmationPanel
          title="Bid prepared successfully"
          summary={[
            { label: "Bid ID", value: selectedBid.id },
            { label: "Estimated value", value: formatCurrency(parsedBidAmount) },
            { label: "Match score", value: `${match.matchScore}/100` },
          ]}
          whatNext={["Wait for evaluation", "Prepare for reverse auction"]}
          actions={[
            {
              label: "Track this bid",
              action: `/opportunities/${selectedBid.id}`,
            },
          ]}
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <PageHeader
        title="True Cost Simulator"
        backUrl="/"
        subtitle={`Simulate freight, GST, working capital, and L1 risk for ${seller.businessName}.`}
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select a bid</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bid-select">Tender</Label>
            <select
              id="bid-select"
              value={selectedBidId}
              onChange={(e) => setSelectedBidId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {bids.map((bid) => (
                <option key={bid.id} value={bid.id}>
                  {bid.title} — {formatCurrency(bid.estimatedValue)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bid-amount">Your bid amount (₹)</Label>
            <Input
              id="bid-amount"
              type="number"
              min="0"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedBid.department} · {selectedBid.location.city},{" "}
            {selectedBid.location.state} · {selectedBid.quantity} {selectedBid.unit}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-base">Base analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {analysis.breakdown.map((line) => (
              <li
                key={line.item}
                className="flex items-start justify-between gap-3 border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{line.item}</p>
                  <p className="text-xs text-muted-foreground">{line.note}</p>
                </div>
                <p className="shrink-0 font-medium tabular-nums">
                  {formatCurrency(line.amount)}
                </p>
              </li>
            ))}
            <li className="flex justify-between pt-2 font-bold">
              <span>Total true cost</span>
              <span className="tabular-nums">{formatCurrency(analysis.totalCost)}</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-base">True margin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-lg">
            Your bid of <strong>{formatCurrency(analysis.estimatedRevenue)}</strong> has a
            real margin of only{" "}
            <strong
              className={cn(
                analysis.realMargin >= 0
                  ? "text-green-700 dark:text-green-400"
                  : "text-destructive"
              )}
            >
              {formatCurrency(analysis.realMargin)}
            </strong>{" "}
            ({analysis.realMarginPercent}%)
          </p>
          <p className="text-sm text-muted-foreground">
            Minimum profitable bid (floor):{" "}
            <strong className="text-foreground">{formatCurrency(analysis.floorPrice)}</strong>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="size-5 text-amber-600" aria-hidden="true" />
            <CardTitle className="text-base">Stress test</CardTitle>
          </div>
          <CardDescription>What happens when things go wrong?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {scenarios.map((scenario) => (
            <div
              key={scenario.scenario}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border p-3 text-sm",
                scenario.isViable
                  ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                  : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
              )}
            >
              <div className="flex items-center gap-2">
                {scenario.isViable ? (
                  <CheckCircle2 className="size-4 text-green-600" aria-hidden="true" />
                ) : (
                  <XCircle className="size-4 text-destructive" aria-hidden="true" />
                )}
                <span>{scenario.scenario}</span>
              </div>
              <span
                className={cn(
                  "font-medium tabular-nums",
                  scenario.margin < 0 ? "text-destructive" : ""
                )}
              >
                {formatCurrency(scenario.margin)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
        </div>

        <div className="space-y-6">
      <Card className={cn("border-2", recommendationColor(analysis.recommendation))}>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">Bid / No-Bid decision</CardTitle>
            <Badge
              variant={
                analysis.recommendation === "walk_away" ? "destructive" : "default"
              }
            >
              {recommendationLabel(analysis.recommendation)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            {analysis.recommendation === "walk_away" ? (
              <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
            ) : analysis.recommendation === "caution" ? (
              <AlertTriangle
                className="mt-0.5 size-4 shrink-0 text-amber-600"
                aria-hidden="true"
              />
            ) : (
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-green-600"
                aria-hidden="true"
              />
            )}
            <p>{analysis.recommendationReason}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Risk level: {analysis.riskLevel.toUpperCase()} · Floor price:{" "}
            {formatCurrency(analysis.floorPrice)}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button type="button" size="lg" onClick={() => setBidSubmitted(true)}>
          Submit bid
        </Button>
        <Link
          href={`/opportunities/${selectedBid.id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          View tender details
        </Link>
        <Link
          href="/freight-decoupler"
          className={buttonVariants({ variant: "outline" })}
        >
          Freight decoupler
        </Link>
        <Link href="/opportunities" className={buttonVariants()}>
          Find more opportunities
        </Link>
      </div>
        </div>
      </div>
    </PageShell>
  );
}

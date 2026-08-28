"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Calculator, CheckCircle2, TrendingDown, XCircle } from "lucide-react";

import bidsData from "@/data/bids.json";
import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationPanel } from "@/components/ui/confirmation-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BidOpportunity, SellerProfile, parseBids } from "@/lib/schemas";
import { BidRecommendation, calculateTrueCost, stressTest } from "@/lib/rules/true-cost";
import { computeMatch } from "@/lib/rules/match";
import { getSeller } from "@/lib/store";
import { focusElementById } from "@/lib/a11y/focus";
import { cn } from "@/lib/utils";

const bids = parseBids(bidsData);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function recommendationLabel(rec: BidRecommendation): string {
  switch (rec) {
    case "strong_bid": return "Strong Bid";
    case "bid": return "Bid";
    case "caution": return "Proceed with Caution";
    case "walk_away": return "Walk Away";
  }
}

function recommendationColor(rec: BidRecommendation): string {
  switch (rec) {
    case "strong_bid": return "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
    case "bid": return "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20";
    case "caution": return "border-amber-500 bg-amber-50 dark:bg-amber-950/30";
    case "walk_away": return "border-destructive bg-destructive/10";
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
    if (!profile) { router.replace("/setup"); return; }
    setSeller(profile);
    setReady(true);
  }, [router]);

  const selectedBid = useMemo(() => bids.find((bid) => bid.id === selectedBidId) ?? bids[0], [selectedBidId]);

  useEffect(() => {
    if (selectedBid) setBidAmount(String(selectedBid.estimatedValue));
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
    if (bidSubmitted) queueMicrotask(() => focusElementById("confirmation-panel"));
  }, [bidSubmitted]);

  if (!ready || !seller || !selectedBid || !analysis || !match) {
    return <PageShell><CardSkeleton rows={8} /></PageShell>;
  }

  if (bidSubmitted) {
    return (
      <PageShell>
        <ConfirmationPanel
          title="Bid prepared successfully"
          summary={[
            { label: "Bid ID", value: selectedBid.id },
            { label: "Estimated value", value: formatCurrency(parsedBidAmount) },
            { label: "Match score", value: `${match.matchScore}/100` },
          ]}
          whatNext={["Wait for evaluation", "Prepare for reverse auction"]}
          actions={[{ label: "Track this bid", action: `/opportunities/${selectedBid.id}` }]}
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-5">
      {/* Back */}
      <Link href="/opportunities" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-3" />Back to opportunities
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">True Cost Simulator</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Simulate freight, GST, working capital, and L1 risk</h1>
        <p className="mt-1 text-sm text-muted-foreground">For {seller.businessName} — see the real cost before you bid.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        {/* Left column */}
        <div className="space-y-4">
          {/* Bid selector */}
          <div className="rounded-xl border bg-card p-4">
            <p className="mb-3 text-xs font-bold">Select a bid</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="bid-select" className="text-[10px]">Tender</Label>
                <select
                  id="bid-select"
                  value={selectedBidId}
                  onChange={(e) => setSelectedBidId(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/50"
                >
                  {bids.map((bid) => (
                    <option key={bid.id} value={bid.id}>{bid.title} — {formatCurrency(bid.estimatedValue)}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bid-amount" className="text-[10px]">Your bid amount (₹)</Label>
                <Input id="bid-amount" type="number" min="0" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} className="h-9 text-xs" />
              </div>
              <p className="text-[10px] text-muted-foreground">{selectedBid.department} · {selectedBid.location.city}, {selectedBid.location.state}</p>
            </div>
          </div>

          {/* Base analysis */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="size-4 text-primary" />
              <p className="text-xs font-bold">Base analysis</p>
            </div>
            <ul className="space-y-2 text-xs">
              {analysis.breakdown.map((line) => (
                <li key={line.item} className="flex items-start justify-between gap-3 border-b border-dashed border-border/50 pb-2 last:border-0">
                  <div><p className="font-medium">{line.item}</p><p className="text-[10px] text-muted-foreground">{line.note}</p></div>
                  <p className="shrink-0 font-semibold tabular-nums">{formatCurrency(line.amount)}</p>
                </li>
              ))}
              <li className="flex justify-between pt-2 text-sm font-bold"><span>Total true cost</span><span className="tabular-nums">{formatCurrency(analysis.totalCost)}</span></li>
            </ul>
          </div>

          {/* True margin */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="mb-1 text-xs font-bold">True margin</p>
            <p className="text-sm">
              Your bid of <strong>{formatCurrency(analysis.estimatedRevenue)}</strong> has a real margin of{" "}
              <strong className={cn(analysis.realMargin >= 0 ? "text-emerald-700" : "text-destructive")}>{formatCurrency(analysis.realMargin)}</strong> ({analysis.realMarginPercent}%)
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">Floor price: <strong className="text-foreground">{formatCurrency(analysis.floorPrice)}</strong></p>
          </div>

          {/* Stress test */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="size-4 text-amber-500" />
              <p className="text-xs font-bold">Stress test</p>
            </div>
            <div className="space-y-1.5">
              {scenarios.map((scenario) => (
                <div key={scenario.scenario} className={cn("flex items-center justify-between gap-2 rounded-lg border p-2.5 text-xs", scenario.isViable ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50")}>
                  <div className="flex items-center gap-1.5">
                    {scenario.isViable ? <CheckCircle2 className="size-3 text-emerald-500" /> : <XCircle className="size-3 text-destructive" />}
                    <span>{scenario.scenario}</span>
                  </div>
                  <span className={cn("font-semibold tabular-nums", scenario.margin < 0 && "text-destructive")}>{formatCurrency(scenario.margin)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Bid recommendation */}
          <div className={cn("rounded-xl border-2 p-4", recommendationColor(analysis.recommendation))}>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs font-bold">Bid / No-Bid decision</p>
              <Badge variant={analysis.recommendation === "walk_away" ? "destructive" : "default"}>{recommendationLabel(analysis.recommendation)}</Badge>
            </div>
            <p className="text-xs">{analysis.recommendationReason}</p>
            <p className="mt-1 text-[10px] text-muted-foreground">Risk: {analysis.riskLevel.toUpperCase()} · Floor: {formatCurrency(analysis.floorPrice)}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="lg" className="min-h-11" onClick={() => setBidSubmitted(true)}>Submit bid</Button>
            <Link href={`/opportunities/${selectedBid.id}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-4 text-xs font-semibold transition hover:bg-muted/50">View details</Link>
            <Link href="/freight-decoupler" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-4 text-xs font-semibold transition hover:bg-muted/50">Freight decoupler</Link>
            <Link href="/opportunities" className="inline-flex min-h-11 items-center gap-1.5 rounded-xl gradient-cta px-4 text-xs font-semibold text-white">Find more</Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

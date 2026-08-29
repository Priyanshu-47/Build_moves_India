"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
  IndianRupee,
  XCircle,
} from "lucide-react";

import bidsData from "@/data/bids.json";
import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";
import { ConfirmationPanel } from "@/components/ui/confirmation-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SellerProfile, parseBids } from "@/lib/schemas";
import { BidRecommendation, calculateTrueCost, stressTest } from "@/lib/rules/true-cost";
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

function recommendationBadge(rec: BidRecommendation): string {
  switch (rec) {
    case "strong_bid":
    case "bid":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "caution":
      return "bg-amber-50 text-amber-800 ring-amber-200";
    case "walk_away":
      return "bg-rose-50 text-rose-700 ring-rose-200";
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
    const bidFromQuery = new URLSearchParams(window.location.search).get("bid");
    if (bidFromQuery && bids.some((b) => b.id === bidFromQuery)) {
      setSelectedBidId(bidFromQuery);
    }
    setSeller(profile);
    setReady(true);
  }, [router]);

  const selectedBid = useMemo(
    () => bids.find((bid) => bid.id === selectedBidId) ?? bids[0],
    [selectedBidId]
  );

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
    return (
      <PageShell>
        <CardSkeleton rows={8} />
      </PageShell>
    );
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
    <PageShell className="pb-10">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3" aria-hidden="true" />
        Back to opportunities
      </Link>

      <header className="mt-4 space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          True cost simulator
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Simulate freight, GST, working capital, and L1 risk
        </h1>
        <p className="text-sm text-muted-foreground">
          For {seller.businessName} — see the real cost before you bid.
        </p>
      </header>

      {/* Top row: select bid + decision */}
      <div className="mt-6 grid items-start gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <p className="mb-4 text-sm font-bold text-foreground">Select a bid</p>
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="bid-select" className="text-xs text-muted-foreground">
                Tender
              </Label>
              <select
                id="bid-select"
                value={selectedBidId}
                onChange={(e) => setSelectedBidId(e.target.value)}
                className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              >
                {bids.map((bid) => (
                  <option key={bid.id} value={bid.id}>
                    {bid.title} — {formatCurrency(bid.estimatedValue)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bid-amount" className="text-xs text-muted-foreground">
                Your bid amount (₹)
              </Label>
              <Input
                id="bid-amount"
                type="number"
                min="0"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="h-11 rounded-xl text-sm"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedBid.department} · {selectedBid.location.city},{" "}
              {selectedBid.location.state}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 shadow-sm dark:border-amber-900 dark:bg-amber-950/20">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-foreground">Bid / No-Bid decision</p>
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                recommendationBadge(analysis.recommendation)
              )}
            >
              {recommendationLabel(analysis.recommendation)}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {analysis.recommendationReason}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Risk: {analysis.riskLevel.toUpperCase()} · Floor:{" "}
            {formatCurrency(analysis.floorPrice)}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBidSubmitted(true)}
              className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Submit bid
            </button>
            <Link
              href={`/opportunities/${selectedBid.id}`}
              className="inline-flex h-10 items-center rounded-full border bg-card px-4 text-sm font-semibold transition hover:bg-muted/50"
            >
              View details
            </Link>
            <Link
              href="/freight-decoupler"
              className="inline-flex h-10 items-center rounded-full border bg-card px-4 text-sm font-semibold transition hover:bg-muted/50"
            >
              Freight decoupler
            </Link>
            <Link
              href="/opportunities"
              className="inline-flex h-10 items-center rounded-full border bg-card px-4 text-sm font-semibold transition hover:bg-muted/50"
            >
              Find more
            </Link>
          </div>
        </section>
      </div>

      {/* Bottom row: analysis + margin/stress */}
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Calculator className="size-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-bold text-foreground">Base analysis</p>
          </div>
          <ul className="space-y-0">
            {analysis.breakdown.map((line) => (
              <li
                key={line.item}
                className="flex items-start justify-between gap-4 border-b border-dashed border-border/60 py-3 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{line.item}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{line.note}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatCurrency(line.amount)}
                </p>
              </li>
            ))}
            <li className="flex items-center justify-between gap-4 border-t pt-3.5">
              <span className="text-sm font-bold text-foreground">Total true cost</span>
              <span className="text-base font-extrabold tabular-nums">
                {formatCurrency(analysis.totalCost)}
              </span>
            </li>
          </ul>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border border-primary/15 bg-primary/5 p-5 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <IndianRupee className="size-4 text-primary" aria-hidden="true" />
              <p className="text-sm font-bold text-foreground">True margin</p>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your bid of{" "}
              <strong className="text-foreground">
                {formatCurrency(analysis.estimatedRevenue)}
              </strong>{" "}
              has a real margin of{" "}
              <strong
                className={cn(
                  analysis.realMargin >= 0
                    ? "text-emerald-600"
                    : "text-destructive"
                )}
              >
                {formatCurrency(analysis.realMargin)} ({analysis.realMarginPercent}%)
              </strong>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Floor price:{" "}
              <strong className="text-foreground">
                {formatCurrency(analysis.floorPrice)}
              </strong>
            </p>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="mb-3 text-sm font-bold text-foreground">Stress test</p>
            <div className="space-y-2">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.scenario}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-sm",
                    scenario.isViable
                      ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/20"
                      : "border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/20"
                  )}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    {scenario.isViable ? (
                      <CheckCircle2
                        className="size-4 shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircle
                        className="size-4 shrink-0 text-rose-500"
                        aria-hidden="true"
                      />
                    )}
                    <span className="truncate">{scenario.scenario}</span>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 font-bold tabular-nums",
                      scenario.margin < 0 && "text-rose-600"
                    )}
                  >
                    {formatCurrency(scenario.margin)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}

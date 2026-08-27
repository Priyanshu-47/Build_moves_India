"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Lightbulb,
  MapPin,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import bidsData from "@/data/bids.json";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SellerProfile, parseBids } from "@/lib/schemas";
import {
  analyzeLossPatterns,
  analyzeWinPatterns,
  calculateWinRate,
  getImprovementAreas,
  getPersonalizedAdvice,
  getSweetSpots,
  loadBidHistory,
} from "@/lib/rules/learning";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

const history = loadBidHistory();
const openBids = parseBids(bidsData);

function WinLossPie({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  if (total === 0) return null;

  const winPercent = (wins / total) * 100;
  const lossPercent = 100 - winPercent;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center">
      <div
        className="relative size-36 rounded-full"
        style={{
          background: `conic-gradient(
            var(--color-chart-1) 0% ${winPercent}%,
            var(--color-chart-5) ${winPercent}% 100%
          )`,
        }}
        role="img"
        aria-label={`${wins} wins and ${losses} losses`}
      >
        <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-background text-center">
          <span className="text-2xl font-bold">{Math.round(winPercent)}%</span>
          <span className="text-xs text-muted-foreground">win rate</span>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-chart-1" aria-hidden="true" />
          <span>
            Wins: <strong>{wins}</strong> ({Math.round(winPercent)}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-chart-5" aria-hidden="true" />
          <span>
            Losses: <strong>{losses}</strong> ({Math.round(lossPercent)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LearnPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState(openBids[0]?.id ?? "");

  useEffect(() => {
    const profile = getSeller();
    if (!profile) {
      router.replace("/setup");
      return;
    }
    setSeller(profile);
    setReady(true);
  }, [router]);

  const winPatterns = useMemo(() => analyzeWinPatterns(history), []);
  const lossPatterns = useMemo(() => analyzeLossPatterns(history), []);
  const improvementAreas = useMemo(() => getImprovementAreas(history), []);
  const sweetSpots = useMemo(() => getSweetSpots(history), []);
  const winRate = useMemo(() => calculateWinRate(history), []);

  const selectedBid = useMemo(
    () => openBids.find((bid) => bid.id === selectedBidId) ?? openBids[0],
    [selectedBidId]
  );

  const advice = useMemo(() => {
    if (!seller || !selectedBid) return null;
    return getPersonalizedAdvice(history, selectedBid, seller);
  }, [seller, selectedBid]);

  if (!ready || !seller || !selectedBid || !advice) {
    return (
      <PageShell>
        <CardSkeleton rows={8} />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <PageHeader
        title="GeM Basics"
        backUrl="/"
        subtitle={`${history.length} bids analysed for ${seller.businessName} — patterns, traps, and what to do next.`}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your win/loss record</CardTitle>
          <CardDescription>
            Win rate: {winRate}% ({winPatterns.wins.count} wins out of {history.length}{" "}
            bids)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <WinLossPie wins={winPatterns.wins.count} losses={winPatterns.losses.count} />
          <p className="text-center text-sm text-muted-foreground">
            Average margin on won bids:{" "}
            <strong className="text-foreground">{winPatterns.wins.avgMargin}%</strong>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="size-5 text-destructive" aria-hidden="true" />
            <CardTitle className="text-base">Why you lose</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b text-left">
              <tr>
                <th className="pb-2 font-medium">Reason</th>
                <th className="pb-2 font-medium">Frequency</th>
                <th className="pb-2 font-medium">What to do</th>
              </tr>
            </thead>
            <tbody>
              {lossPatterns.byReason.map((row) => (
                <tr key={row.label} className="border-b last:border-0">
                  <td className="py-2.5">{row.label}</td>
                  <td className="py-2.5 text-muted-foreground">
                    {row.count} bid{row.count !== 1 ? "s" : ""} ({row.percentage}%)
                  </td>
                  <td className="py-2.5">{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="size-5 text-green-600" aria-hidden="true" />
            <CardTitle className="text-base">Your sweet spots</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {sweetSpots.map((spot) => (
              <li key={spot} className="flex items-start gap-2">
                <TrendingUp className="mt-0.5 size-4 shrink-0 text-green-600" aria-hidden="true" />
                {spot}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {lossPatterns.byCategory
              .filter((cat) => cat.winRate >= 40)
              .map((cat) => (
                <Badge key={cat.category} variant="secondary">
                  {cat.label}: {cat.winRate}% win rate
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-amber-600" aria-hidden="true" />
            <CardTitle className="text-base">Your distance trap</CardTitle>
          </div>
          <CardDescription>
            Freight makes distant bids uncompetitive — your win rate drops with distance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {lossPatterns.byDistance.map((band) => (
            <div
              key={band.range}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
            >
              <span className="font-medium">{band.range}</span>
              <span
                className={cn(
                  "font-bold tabular-nums",
                  band.winRate >= 50
                    ? "text-green-600"
                    : band.winRate >= 30
                      ? "text-amber-600"
                      : "text-destructive"
                )}
              >
                {band.winRate}% win rate
              </span>
              <span className="w-full text-xs text-muted-foreground sm:w-auto">
                {band.wins} won · {band.losses} lost
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-base">Personalized advice for your next bid</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="bid-select" className="text-sm font-medium">
              Select a bid
            </label>
            <select
              id="bid-select"
              value={selectedBidId}
              onChange={(e) => setSelectedBidId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {openBids.map((bid) => (
                <option key={bid.id} value={bid.id}>
                  {bid.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>Relevance: {advice.relevanceScore}%</Badge>
            <Badge variant="outline">~{advice.estimatedDistanceKm} km away</Badge>
            <Badge variant="outline">
              Win rate at this distance: {advice.distanceWinRate}%
            </Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-green-200 bg-green-50/50 p-3 dark:border-green-900 dark:bg-green-950/20">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Why you might win
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {advice.whyThisBidMightWin.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-900 dark:bg-red-950/20">
              <p className="text-sm font-medium text-destructive">Why you might lose</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {advice.whyThisBidMightLose.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          {advice.pastSimilarBids.length > 0 && (
            <div className="text-sm">
              <p className="font-medium">Similar past bids</p>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {advice.pastSimilarBids.map((bid) => (
                  <li key={bid.bidId}>
                    {bid.title} —{" "}
                    <span
                      className={bid.result === "won" ? "text-green-600" : "text-destructive"}
                    >
                      {bid.result}
                      {bid.margin !== null ? ` (${bid.margin}% margin)` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="rounded-lg border bg-muted/30 p-3 text-sm">
            <strong>Recommendation:</strong> {advice.recommendation}
          </p>

          <Link
            href={`/opportunities/${selectedBid.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View tender
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Improvement plan</CardTitle>
          <CardDescription>
            Do these 3 things to improve your win rate from {winRate}% toward{" "}
            {Math.min(winRate + 20, 55)}%
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {improvementAreas.map((area, index) => (
            <div key={area.area} className="flex gap-3 rounded-lg border p-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {index + 1}
              </span>
              <div>
                <p className="font-medium">{area.area}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {area.currentPerformance}
                </p>
                <p className="mt-1 text-xs text-primary">{area.potentialImpact}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/simulate" className={buttonVariants({ variant: "outline" })}>
          True cost simulator
        </Link>
        <Link href="/opportunities" className={buttonVariants()}>
          Find next bid
        </Link>
      </div>
    </PageShell>
  );
}

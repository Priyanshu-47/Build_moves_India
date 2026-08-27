"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import bidsData from "@/data/bids.json";
import comparablesData from "@/data/comparables.json";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SellerProfile, parseBids, parseComparables } from "@/lib/schemas";
import { computePriceIntelligence } from "@/lib/rules/pricing";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PricingPage() {
  const router = useRouter();
  const params = useParams<{ bidId: string }>();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);

  const bid = useMemo(() => {
    return parseBids(bidsData).find((item) => item.id === params.bidId) ?? null;
  }, [params.bidId]);

  const pricing = useMemo(() => {
    if (!seller || !bid) return null;
    return computePriceIntelligence(bid, seller, parseComparables(comparablesData));
  }, [seller, bid]);

  useEffect(() => {
    const profile = getSeller();
    if (!profile) {
      router.replace("/setup");
      return;
    }
    setSeller(profile);
    setReady(true);
  }, [router]);

  if (!ready || !seller) {
    return (
      <PageShell>
        <CardSkeleton rows={6} />
      </PageShell>
    );
  }

  if (!bid || !pricing) {
    return (
      <PageShell>
        <PageHeader title="Pricing" backUrl="/opportunities" />
        <p className="text-sm text-muted-foreground">Bid not found.</p>
      </PageShell>
    );
  }

  const chartMax = Math.max(
    pricing.comparableRange.max,
    pricing.recommendedRange.high
  );

  return (
    <PageShell>
      <PageHeader
        title="Pricing"
        backUrl={`/opportunities/${bid.id}`}
        subtitle={bid.title}
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Recommended range</CardTitle>
            <CardDescription>Per-unit bid price (synthetic comparables)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Market low</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(pricing.comparableRange.min)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recommended</p>
                <p className="text-lg font-semibold text-green-700">
                  {formatCurrency(pricing.recommendedRange.low)} –{" "}
                  {formatCurrency(pricing.recommendedRange.high)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Market high</p>
                <p className="text-lg font-semibold">
                  {formatCurrency(pricing.comparableRange.max)}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">{pricing.guidance}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimated margin</CardTitle>
            <CardDescription>At recommended midpoint vs assumed cost</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">
              {formatCurrency(pricing.estimatedMargin.amount)}
              <span className="ml-2 text-lg font-medium text-muted-foreground">
                ({pricing.estimatedMargin.percent}%)
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Per unit, before taxes and logistics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price comparison</CardTitle>
            <CardDescription>Comparable range vs your target band</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Market range</span>
                <span>
                  {formatCurrency(pricing.comparableRange.min)} –{" "}
                  {formatCurrency(pricing.comparableRange.max)}
                </span>
              </div>
              <div className="relative h-6 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute top-1 h-4 rounded-full bg-blue-400/70"
                  style={{
                    left: `${(pricing.comparableRange.min / chartMax) * 100}%`,
                    width: `${((pricing.comparableRange.max - pricing.comparableRange.min) / chartMax) * 100}%`,
                  }}
                />
                <div
                  className="absolute top-0 h-6 rounded-full border-2 border-green-600 bg-green-500/30"
                  style={{
                    left: `${(pricing.recommendedRange.low / chartMax) * 100}%`,
                    width: `${((pricing.recommendedRange.high - pricing.recommendedRange.low) / chartMax) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-400" />
                Comparable awards
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-green-600" />
                Recommended band
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparable purchases</CardTitle>
            <CardDescription>
              {pricing.comparables.length > 0
                ? `${pricing.comparables.length} similar government awards`
                : "No direct comparables — using bid estimate"}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Purchase</th>
                  <th className="pb-2 pr-4 font-medium">Department</th>
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Qty</th>
                  <th className="pb-2 font-medium">Awarded price</th>
                </tr>
              </thead>
              <tbody>
                {(pricing.comparables.length > 0
                  ? pricing.comparables
                  : parseComparables(comparablesData).slice(0, 0)
                ).map((comparable) => (
                  <tr key={comparable.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{comparable.title}</td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {comparable.department}
                    </td>
                    <td className="py-2 pr-4">{formatDate(comparable.date)}</td>
                    <td className="py-2 pr-4">
                      {comparable.quantity} {comparable.unit}
                    </td>
                    <td className={cn("py-2 font-medium")}>
                      {formatCurrency(comparable.awardedPrice)}
                    </td>
                  </tr>
                ))}
                {pricing.comparables.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-muted-foreground">
                      No matching comparables in dataset. Pricing derived from tender
                      estimate of {formatCurrency(bid.estimatedValue / bid.quantity)} per
                      unit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Link
          href={`/opportunities/${bid.id}/prepare`}
          className={buttonVariants({ size: "lg", className: "h-11 w-full" })}
        >
          Prepare Bid
        </Link>
      </div>
    </PageShell>
  );
}

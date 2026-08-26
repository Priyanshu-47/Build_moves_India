"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SellerProfile } from "@/lib/schemas";
import {
  ExpansionAdvice,
  getCategoryOptions,
  getScarcityByCategory,
  getSellerExpansionAdvice,
  getVendorDeserts,
} from "@/lib/rules/regional-scarcity";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

function scarcityBadge(level: string) {
  switch (level) {
    case "critical":
      return <Badge variant="destructive">CRITICAL</Badge>;
    case "high":
      return <Badge variant="secondary">HIGH</Badge>;
    case "moderate":
      return <Badge variant="outline">MODERATE</Badge>;
    default:
      return <Badge variant="outline">{level.toUpperCase()}</Badge>;
  }
}

function heatColor(index: number): string {
  if (index >= 75) return "bg-red-600";
  if (index >= 55) return "bg-orange-500";
  if (index >= 35) return "bg-amber-400";
  return "bg-yellow-300";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function ExpansionAdviceCard({ advice }: { advice: ExpansionAdvice }) {
  const top = advice.topRecommendation;
  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-base">Your expansion advice</CardTitle>
        <CardDescription>Personalized based on your seller profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>
          <span className="text-muted-foreground">You&apos;re in</span>{" "}
          <strong>{advice.sellerLocation}</strong>
        </p>
        <p>
          <span className="text-muted-foreground">Your products:</span>{" "}
          <strong>{advice.sellerProducts}</strong>
        </p>
        <div className="rounded-lg border bg-background p-3">
          <p className="font-medium">
            Recommended: Expand to {top.region}
          </p>
          <p className="mt-1 text-muted-foreground">
            Why: {top.sellerCount} sellers, {top.demandCount} bids/month, high scarcity
          </p>
          <p className="mt-2">
            Estimated win rate:{" "}
            <strong className="text-green-700 dark:text-green-400">
              {Math.round(top.winRate * 100)}%
            </strong>{" "}
            (vs 12% in your home state)
          </p>
          <p>
            Transport cost:{" "}
            <strong>{formatCurrency(top.transportCost)}</strong> per order (
            {top.transportPercent}% of avg order value)
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Also consider: {advice.recommendedRegions.slice(1).join(", ")}
        </p>
      </CardContent>
    </Card>
  );
}

export function VendorDesertDashboard() {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    setSeller(getSeller());
  }, []);

  const deserts = useMemo(() => getVendorDeserts(), []);
  const categoryOptions = useMemo(() => getCategoryOptions(), []);

  const categoryData = useMemo(() => {
    if (categoryFilter === "all") return getScarcityByCategory();
    return getScarcityByCategory(categoryFilter);
  }, [categoryFilter]);

  const advice = useMemo(() => getSellerExpansionAdvice(seller), [seller]);

  return (
    <div className="space-y-8">
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="text-base">The Problem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>62L sellers registered, but concentrated in 10 states</p>
          <p>Remote regions have 40% fewer options, 30–50% higher prices</p>
          <p className="font-medium text-amber-900 dark:text-amber-100">
            Government departments in NE/JK/Ladakh waste public money on inflated procurement
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Scarcity heatmap</CardTitle>
          </div>
          <CardDescription>Vendor deserts — where sellers are needed most</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Region</th>
                  <th className="pb-2 pr-3 font-medium">Sellers</th>
                  <th className="pb-2 pr-3 font-medium">Bids/Month</th>
                  <th className="pb-2 pr-3 font-medium">Scarcity</th>
                  <th className="pb-2 pr-3 font-medium">Index</th>
                  <th className="pb-2 font-medium">Your Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {deserts.map((row) => (
                  <tr key={row.region} className="border-b last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{row.region}</td>
                    <td className="py-2.5 pr-3">{row.sellerCount}</td>
                    <td className="py-2.5 pr-3">{row.demandCount}</td>
                    <td className="py-2.5 pr-3">
                      {scarcityBadge(
                        row.scarcityIndex >= 70
                          ? "critical"
                          : row.scarcityIndex >= 50
                            ? "high"
                            : "moderate"
                      )}
                    </td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn("h-full rounded-full", heatColor(row.scarcityIndex))}
                            style={{ width: `${row.scarcityIndex}%` }}
                          />
                        </div>
                        <span className="text-xs tabular-nums">{row.scarcityIndex}</span>
                      </div>
                    </td>
                    <td
                      className={cn(
                        "py-2.5",
                        row.scarcityIndex >= 70 && "font-medium text-primary"
                      )}
                    >
                      {row.sellerOpportunity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category-wise scarcity</CardTitle>
          <CardDescription>Filter by product category in Northeast & remote regions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategoryFilter("all")}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                categoryFilter === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "hover:bg-muted"
              )}
            >
              All categories
            </button>
            {categoryOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setCategoryFilter(opt.key)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  categoryFilter === opt.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Category</th>
                  <th className="pb-2 pr-4 font-medium">NE Sellers</th>
                  <th className="pb-2 pr-4 font-medium">NE Bids</th>
                  <th className="pb-2 font-medium">Scarcity</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.map((row) => (
                  <tr key={row.categoryKey} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{row.category}</td>
                    <td className="py-2.5 pr-4">{row.neSellers}</td>
                    <td className="py-2.5 pr-4">{row.neBids}</td>
                    <td className="py-2.5">{scarcityBadge(row.scarcityLevel)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ExpansionAdviceCard advice={advice} />

      <Card>
        <CardHeader>
          <CardTitle>How to serve remote regions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <Link href="/freight-decoupler" className="underline-offset-4 hover:underline">
                Use decoupled freight pricing
              </Link>{" "}
              — protect margin on long-haul deliveries
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Partner with India Post for last-mile delivery in remote areas
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Consider regional warehouses in Guwahati or Shillong
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              GeM has special MSE support for NE/JK/Ladakh sellers
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Impact calculator</CardTitle>
          </div>
          <CardDescription>If 500 sellers expand to 2 remote regions each</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">New bids/month</p>
              <p className="text-xl font-bold">1,500–2,500</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Average order</p>
              <p className="text-xl font-bold">₹5–15L</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Additional economic activity</p>
              <p className="text-xl font-bold">₹75–375 Cr/year</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Regional price reduction</p>
              <p className="text-xl font-bold">20–30%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

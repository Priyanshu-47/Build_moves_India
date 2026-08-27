import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  MapPin,
  Package,
  TrendingUp,
  Truck,
} from "lucide-react";

import { Disclaimer } from "@/components/Disclaimer";
import { SOURCE_BUSINESS_STANDARD, SOURCE_MSMED_RBI } from "@/lib/sources";
import { FreightCalculator } from "@/components/FreightCalculator";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRegionalScarcity } from "@/lib/rules/freight";
import { cn } from "@/lib/utils";

const EXPANSION_TIPS = [
  "Use decoupled pricing — freight is transparent to buyer, margin protected for seller",
  "Partner with India Post for remote NE/JK/Ladakh deliveries — last-mile coverage",
  "Focus on 2–3 remote regions to build reputation before expanding nationally",
  "GeM has special MSE support and procurement reservation for NE/JK/Ladakh",
] as const;

function scarcityBadge(level: string) {
  switch (level) {
    case "critical":
      return <Badge variant="destructive">CRITICAL</Badge>;
    case "high":
      return <Badge variant="secondary">HIGH</Badge>;
    default:
      return <Badge variant="outline">{level.toUpperCase()}</Badge>;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FreightDecouplerPage() {
  const scarcity = getRegionalScarcity();

  return (
    <PageShell className="space-y-8">
      <section className="space-y-3 text-center sm:text-left">
        <p className="text-sm font-medium text-primary">GeM-ONDC Dynamic Freight Decoupler</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The Inclusive Freight Trap — solved
        </h1>
        <p className="text-muted-foreground">
          GeM forces inclusive freight pricing. Sellers in Kerala lose money shipping to
          Arunachal Pradesh — or restrict territory, creating vendor deserts. Decouple product
          price from freight. Seller risk eliminated.
        </p>
      </section>

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" aria-hidden="true" />
            <CardTitle>The Problem — inclusive freight</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <p className="mb-2 text-sm font-medium">Old model flow</p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <Package className="size-4 shrink-0" aria-hidden="true" />
                  Seller lists ₹1,500 (product + guessed freight)
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="size-4 shrink-0" aria-hidden="true" />
                  Actual freight to Arunachal: ₹2,500
                </p>
                <p className="flex items-center gap-2 font-bold text-destructive">
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                  Seller loses ₹1,000 — or cancels and gets penalized
                </p>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="mb-2 text-sm font-medium">Example: Kerala → Arunachal Pradesh</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Water filter, 5 kg — product ₹1,500</li>
                <li>• Distance: ~3,200 km</li>
                <li>• Real freight: ₹2,500–₹18,000 depending on route</li>
                <li>• Seller either absorbs loss or declines territory</li>
              </ul>
            </div>
          </div>
          <p className="text-sm font-medium text-destructive">
            Result: vendor deserts in Northeast, Jammu & Kashmir, and Ladakh — buyers pay
            inflated prices with fewer sellers.
          </p>
        </CardContent>
      </Card>

      <Card className="border-green-200 dark:border-green-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-green-600" aria-hidden="true" />
            <CardTitle>The Solution — decoupled pricing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-green-50 p-3 dark:bg-green-950/20">
              <p className="text-sm font-medium">Seller lists product price only</p>
              <p className="mt-1 text-2xl font-bold">₹1,500</p>
              <p className="text-xs text-muted-foreground">Margin guaranteed</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Buyer sees real freight</p>
              <p className="mt-1 text-2xl font-bold">+ ₹2,500</p>
              <p className="text-xs text-muted-foreground">Transparent breakdown</p>
            </div>
            <div className="rounded-lg border bg-primary/5 p-3">
              <p className="text-sm font-medium">Total to buyer</p>
              <p className="mt-1 text-2xl font-bold">₹4,000</p>
              <p className="text-xs text-muted-foreground">No hidden subsidy</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Product price and freight shown separately — full transparency
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Seller receives guaranteed product price — zero freight risk
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Freight collected goes to logistics partner — ONDC-compatible model
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Try it — Freight Calculator</CardTitle>
          <CardDescription>
            Real-time decoupled pricing for any seller PIN → buyer PIN route
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FreightCalculator />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Regional scarcity map</CardTitle>
          </div>
          <CardDescription>
            These regions NEED sellers. Less competition, higher win rate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Region</th>
                  <th className="pb-2 pr-4 font-medium">Active Sellers</th>
                  <th className="pb-2 pr-4 font-medium">Bids/Month</th>
                  <th className="pb-2 pr-4 font-medium">Scarcity</th>
                  <th className="pb-2 font-medium">Opportunity</th>
                </tr>
              </thead>
              <tbody>
                {scarcity.map((row) => (
                  <tr key={row.region} className="border-b last:border-0">
                    <td className="py-2.5 pr-4 font-medium">{row.region}</td>
                    <td className="py-2.5 pr-4">{row.sellerCount}</td>
                    <td className="py-2.5 pr-4">{row.bidsPerMonth}</td>
                    <td className="py-2.5 pr-4">{scarcityBadge(row.opportunityLevel)}</td>
                    <td className={cn("py-2.5", row.opportunityLevel === "critical" && "font-medium text-primary")}>
                      {row.winMultiplier}× more chances to win
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
          <CardTitle>How to expand profitably</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {EXPANSION_TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Impact if 500 sellers expand to remote regions</CardTitle>
          <CardDescription>Projected national economic impact</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">New bids per month</p>
              <p className="text-xl font-bold">1,500–2,500</p>
              <p className="text-xs text-muted-foreground">3–5 bids/seller × 500 sellers</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Average order value</p>
              <p className="text-xl font-bold">{formatCurrency(1_000_000)}</p>
              <p className="text-xs text-muted-foreground">₹5–15L range midpoint</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Additional economic activity</p>
              <p className="text-xl font-bold">₹75–375 Cr/year</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Regional price reduction</p>
              <p className="text-xl font-bold">20–30%</p>
              <p className="text-xs text-muted-foreground">More sellers = competition = lower prices</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/opportunities"
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 sm:w-auto"
      >
        Find opportunities in remote regions
      </Link>

      <Disclaimer />
      <p className="text-xs text-muted-foreground">
        Freight estimates are simulated based on weight slabs, distance, and zone multipliers.{" "}
        {SOURCE_BUSINESS_STANDARD}. Legal claims: {SOURCE_MSMED_RBI}.
      </p>
    </PageShell>
  );
}

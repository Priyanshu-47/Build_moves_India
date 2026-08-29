"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileText,
  MapPin,
  Package,
  Shield,
  TrendingUp,
  Truck,
} from "lucide-react";

import { FreightCalculator } from "@/components/FreightCalculator";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { getRegionalScarcity } from "@/lib/rules/freight";
import { SOURCE_BUSINESS_STANDARD, SOURCE_MSMED_RBI } from "@/lib/sources";
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
    <PageShell wide className="space-y-8">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to opportunities
      </Link>

      {/* Header */}
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          GeM-ONDC Dynamic Freight Decoupler
        </p>
        <h1 className="flex flex-wrap items-center gap-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          The Inclusive Freight Trap — solved
          <CheckCircle2 className="size-7 text-emerald-500" aria-hidden="true" />
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          GeM forces inclusive freight pricing. Sellers in Kerala lose money shipping to Arunachal
          Pradesh — or restrict territory, creating vendor deserts. Decouple product price from
          freight. Seller risk eliminated.
        </p>
      </section>

      {/* Problem card */}
      <section className="overflow-hidden rounded-2xl border border-red-200 bg-card shadow-sm dark:border-red-900">
        <div className="border-b border-red-100 bg-red-50/80 px-5 py-3 dark:border-red-900 dark:bg-red-950/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-red-600" aria-hidden="true" />
            <h2 className="text-sm font-bold text-red-700 dark:text-red-400">
              The Problem — inclusive freight
            </h2>
          </div>
        </div>
        <div className="grid gap-0 lg:grid-cols-12">
          <div className="space-y-4 p-5 lg:col-span-5 lg:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Old model flow
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3">
                <Package className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-sm">
                  Seller lists <strong>₹1,500</strong> (product + guessed freight)
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3">
                <Truck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-sm">
                  Actual freight to Arunachal: <strong>₹2,500</strong>
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-red-600" />
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  Seller loses ₹1,000 — or cancels and gets penalized
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-red-100 p-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:p-6 dark:border-red-900">
            <div className="mb-3 flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Example: Kerala → Arunachal Pradesh
              </p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Water filter, 5 kg — product ₹1,500</li>
              <li>• Distance: ~3,200 km</li>
              <li>• Real freight: ₹2,500 – ₹18,000 depending on route</li>
              <li>• Seller either absorbs loss or declines territory</li>
            </ul>
          </div>

          <div className="relative flex items-center justify-center border-t border-red-100 bg-gradient-to-br from-blue-50 to-sky-50 p-6 lg:col-span-3 lg:border-l lg:border-t-0 dark:border-red-900 dark:from-blue-950/30 dark:to-sky-950/20">
            <div className="relative" aria-hidden="true">
              <div className="absolute -left-6 top-1/2 size-3 -translate-y-1/2 rounded-full bg-emerald-400 shadow" />
              <div className="absolute -right-2 top-0 size-3 rounded-full bg-red-400 shadow" />
              <svg viewBox="0 0 120 80" className="w-36 text-primary/30">
                <path
                  d="M10 50 Q40 20 70 40 T110 25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                />
              </svg>
              <div className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-card">
                <Truck className="size-7 text-primary" />
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-red-100 bg-red-50/60 px-5 py-3 dark:border-red-900 dark:bg-red-950/30">
          <p className="flex items-start gap-2 text-xs font-medium text-red-700 dark:text-red-400 sm:text-sm">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            Result: vendor deserts in Northeast, Jammu & Kashmir, and Ladakh — buyers pay inflated
            prices with fewer sellers.
          </p>
        </div>
      </section>

      {/* Solution card */}
      <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-card shadow-sm dark:border-emerald-900">
        <div className="border-b border-emerald-100 bg-emerald-50/80 px-5 py-3 dark:border-emerald-900 dark:bg-emerald-950/40">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-emerald-600" aria-hidden="true" />
            <h2 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              The Solution — decoupled pricing
            </h2>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border bg-emerald-50/50 p-5 dark:bg-emerald-950/20">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50">
                <Shield className="size-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Seller lists product price only
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums">₹1,500</p>
              <p className="mt-1 text-xs text-muted-foreground">Margin guaranteed</p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/50">
                <Truck className="size-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Buyer sees real freight
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-primary">+ ₹2,500</p>
              <p className="mt-1 text-xs text-muted-foreground">Transparent breakdown</p>
            </div>
            <div className="rounded-2xl border bg-primary/5 p-5">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Total to buyer
              </p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums">₹4,000</p>
              <p className="mt-1 text-xs text-muted-foreground">No hidden subsidy</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {[
              "Product price and freight shown separately — full transparency",
              "Seller receives guaranteed product price — zero freight risk",
              "ONDC-compatible model",
            ].map((item) => (
              <p key={item} className="flex items-center gap-2 text-xs font-medium sm:text-sm">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator CTA strip */}
      <section className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calculator className="size-5" />
          </div>
          <div>
            <p className="font-bold">Try it — Freight Calculator</p>
            <p className="text-sm text-muted-foreground">
              Real-time decoupled pricing for any seller PIN → buyer PIN route
            </p>
          </div>
        </div>
        <a
          href="#freight-calculator"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Calculate Freight
          <ArrowRight className="size-4" />
        </a>
      </section>

      <section id="freight-calculator" className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <FreightCalculator />
      </section>

      {/* Scarcity */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="size-5 text-primary" />
          <div>
            <h2 className="font-bold">Regional scarcity map</h2>
            <p className="text-xs text-muted-foreground">
              These regions NEED sellers. Less competition, higher win rate.
            </p>
          </div>
        </div>
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
                  <td className="py-3 pr-4 font-medium">{row.region}</td>
                  <td className="py-3 pr-4">{row.sellerCount}</td>
                  <td className="py-3 pr-4">{row.bidsPerMonth}</td>
                  <td className="py-3 pr-4">{scarcityBadge(row.opportunityLevel)}</td>
                  <td
                    className={cn(
                      "py-3",
                      row.opportunityLevel === "critical" && "font-medium text-primary"
                    )}
                  >
                    {row.winMultiplier}× more chances to win
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="font-bold">How to expand profitably</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {EXPANSION_TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <h2 className="font-bold">Impact if 500 sellers expand to remote regions</h2>
          <p className="mt-1 text-xs text-muted-foreground">Projected national economic impact</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: "New bids per month", value: "1,500–2,500", note: "3–5 bids/seller × 500" },
              { label: "Average order value", value: formatCurrency(1_000_000), note: "₹5–15L midpoint" },
              { label: "Additional economic activity", value: "₹75–375 Cr/year", note: "" },
              { label: "Regional price reduction", value: "20–30%", note: "More sellers = competition" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border bg-muted/30 p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-lg font-extrabold tabular-nums">{item.value}</p>
                {item.note && <p className="text-[10px] text-muted-foreground">{item.note}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>

      <Link
        href="/opportunities"
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
      >
        Find opportunities in remote regions
      </Link>

      <p className="text-xs text-muted-foreground">
        Freight estimates are simulated based on weight slabs, distance, and zone multipliers.{" "}
        {SOURCE_BUSINESS_STANDARD}. Legal claims: {SOURCE_MSMED_RBI}.
      </p>
    </PageShell>
  );
}

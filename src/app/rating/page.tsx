"use client";

import { ArrowLeft, AlertTriangle, Star, TrendingUp, TrendingDown } from "lucide-react";

import ratingData from "@/data/seller-rating.json";
import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";

const RATING_FACTORS = [
  { key: "onTimeDelivery" as const, label: "On-time delivery", color: "bg-emerald-500" },
  { key: "qualityCompliance" as const, label: "Quality compliance", color: "bg-blue-500" },
  { key: "buyerSatisfaction" as const, label: "Buyer satisfaction", color: "bg-violet-500" },
  { key: "responseRate" as const, label: "Response rate", color: "bg-amber-500" },
  { key: "orderCancellation" as const, label: "Order cancellation", color: "bg-red-500" },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn("size-4", i < Math.floor(value) ? "fill-yellow-400 text-yellow-400" : i < value ? "fill-yellow-200 text-yellow-400" : "text-muted-foreground/30")}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function RatingPage() {
  const maxRevenue = Math.max(...ratingData.monthlyTrend.map((m) => m.revenue));
  const maxOrders = Math.max(...ratingData.monthlyTrend.map((m) => m.orders));

  const tips: string[] = [];
  if (ratingData.responseRate < 4) tips.push(`Your response rate is ${ratingData.responseRate} — reply to buyer queries within 24 hours.`);
  if (ratingData.buyerSatisfaction < 4.2) tips.push("Buyer satisfaction is below 4.2 — follow up after delivery for feedback.");
  if (ratingData.onTimeDelivery >= 4.5) tips.push("Strong on-time delivery — highlight this in bid proposals.");

  return (
    <PageShell className="space-y-5">
      {/* Header */}
      <div>
        <button type="button" onClick={() => window.history.back()} className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-3" /> Back
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Seller Rating</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your GeM seller performance across {ratingData.totalOrders} orders.</p>
      </div>

      {/* Overall rating card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Overall rating</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold">{ratingData.overall}</span>
              <span className="text-lg text-muted-foreground">/ 5</span>
              <StarRating value={ratingData.overall} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total revenue</p>
            <p className="text-lg font-bold text-emerald-600">{formatCurrency(ratingData.totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Low rating alert */}
      {ratingData.overall < 3 && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          Below 3.0 rating = excluded from most tenders
        </div>
      )}

      {/* Rating breakdown */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Rating breakdown</p>
        <div className="space-y-3">
          {RATING_FACTORS.map(({ key, label, color }) => {
            const value = ratingData[key];
            const percent = (value / 5) * 100;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-xs font-bold tabular-nums">{value}/5</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly trend */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly trend</p>
        <div className="space-y-4">
          {ratingData.monthlyTrend.map((month) => (
            <div key={month.month}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{month.month}</span>
                <span className="text-xs text-muted-foreground">{month.orders} orders · {formatCurrency(month.revenue)}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Orders</span>
                    <span className="text-[10px] font-bold tabular-nums">{month.orders}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${(month.orders / maxOrders) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground">Revenue</span>
                    <span className="text-[10px] font-bold tabular-nums">{formatCurrency(month.revenue)}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(month.revenue / maxRevenue) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tips to improve</p>
        <div className="space-y-2">
          {tips.map((tip) => (
            <div key={tip} className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

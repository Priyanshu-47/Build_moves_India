"use client";

import Link from "next/link";
import { AlertTriangle, Lightbulb, Star } from "lucide-react";

import ratingData from "@/data/seller-rating.json";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";

const RATING_FACTORS = [
  { key: "onTimeDelivery" as const, label: "On-time delivery", color: "bg-emerald-500" },
  { key: "qualityCompliance" as const, label: "Quality compliance", color: "bg-blue-500" },
  { key: "buyerSatisfaction" as const, label: "Buyer satisfaction", color: "bg-violet-500" },
  { key: "responseRate" as const, label: "Response rate", color: "bg-amber-500" },
  { key: "orderCancellation" as const, label: "Order cancellation", color: "bg-rose-500" },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function StarRating({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < Math.floor(value)
              ? "fill-amber-400 text-amber-400"
              : i < value
                ? "fill-amber-200 text-amber-400"
                : "text-muted-foreground/30"
          )}
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
  if (ratingData.responseRate < 4) {
    tips.push(
      `Your response rate is ${ratingData.responseRate} — reply to buyer queries within 24 hours.`
    );
  }
  if (ratingData.buyerSatisfaction < 4.2) {
    tips.push("Buyer satisfaction is below 4.2 — follow up after delivery for feedback.");
  }
  if (ratingData.onTimeDelivery >= 4.5) {
    tips.push("Strong on-time delivery — highlight this in bid proposals.");
  }
  if (tips.length === 0) {
    tips.push("Keep delivering on time and responding quickly to protect your rating.");
  }

  return (
    <PageShell className="pb-10">
      <PageHeader
        title="Seller Rating"
        backUrl="/profile"
        subtitle={`Your GeM seller performance across ${ratingData.totalOrders} orders.`}
      />

      {/* Hero score */}
      <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Overall rating
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-4xl font-extrabold tracking-tight tabular-nums text-foreground sm:text-5xl">
                {ratingData.overall}
                <span className="ml-1 text-xl font-semibold text-muted-foreground">/ 5</span>
              </p>
              <StarRating value={ratingData.overall} />
            </div>
          </div>
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 sm:text-right dark:border-emerald-900 dark:bg-emerald-950/30">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700/80 dark:text-emerald-400/80">
              Total revenue
            </p>
            <p className="mt-0.5 text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
              {formatCurrency(ratingData.totalRevenue)}
            </p>
          </div>
        </div>
      </section>

      {ratingData.overall < 3 && (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>
            Below <strong>3.0</strong> rating — you may be excluded from most tenders. Focus on
            the tips below.
          </p>
        </div>
      )}

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-5">
        {/* Breakdown */}
        <section className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-3">
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Rating breakdown
          </p>
          <div className="space-y-5">
            {RATING_FACTORS.map(({ key, label, color }) => {
              const value = ratingData[key];
              const percent = (value / 5) * 100;
              return (
                <div key={key}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                      {value}/5
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all", color)}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Tips */}
        <aside className="rounded-2xl border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" aria-hidden="true" />
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Tips to improve
            </p>
          </div>
          <ul className="space-y-3">
            {tips.map((tip) => (
              <li
                key={tip}
                className="flex gap-2.5 rounded-xl bg-muted/40 px-3.5 py-3 text-sm leading-relaxed text-foreground"
              >
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {tip}
              </li>
            ))}
          </ul>
          <Link
            href="/rating-recovery"
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Open rating recovery plan
          </Link>
        </aside>
      </div>

      {/* Monthly trend */}
      <section className="mt-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Monthly trend
        </p>
        <div className="space-y-5">
          {ratingData.monthlyTrend.map((month) => (
            <div
              key={month.month}
              className="grid gap-3 border-b border-border/60 pb-5 last:border-0 last:pb-0 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-6"
            >
              <p className="text-sm font-bold text-foreground">{month.month}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground">Orders</span>
                    <span className="text-[11px] font-bold tabular-nums">{month.orders}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(month.orders / maxOrders) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-muted-foreground">Revenue</span>
                    <span className="text-[11px] font-bold tabular-nums">
                      {formatCurrency(month.revenue)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              <p className="hidden text-xs text-muted-foreground sm:block sm:text-right">
                {month.orders} orders · {formatCurrency(month.revenue)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

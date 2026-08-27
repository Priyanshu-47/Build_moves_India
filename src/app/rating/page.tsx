"use client";

import { AlertTriangle, Star } from "lucide-react";

import ratingData from "@/data/seller-rating.json";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const RATING_FACTORS = [
  { key: "onTimeDelivery" as const, label: "On-time delivery" },
  { key: "qualityCompliance" as const, label: "Quality compliance" },
  { key: "buyerSatisfaction" as const, label: "Buyer satisfaction" },
  { key: "responseRate" as const, label: "Response rate" },
  { key: "orderCancellation" as const, label: "Order cancellation (lower is better)" },
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
      {Array.from({ length: max }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "size-5",
            index < Math.floor(value)
              ? "fill-yellow-400 text-yellow-400"
              : index < value
                ? "fill-yellow-200 text-yellow-400"
                : "text-muted-foreground/40"
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default function RatingPage() {
  const maxRevenue = Math.max(
    ...ratingData.monthlyTrend.map((item) => item.revenue)
  );
  const maxOrders = Math.max(...ratingData.monthlyTrend.map((item) => item.orders));

  const tips: string[] = [];
  if (ratingData.responseRate < 4) {
    tips.push(
      `Your response rate is ${ratingData.responseRate} — reply to buyer queries within 24 hours.`
    );
  }
  if (ratingData.buyerSatisfaction < 4.2) {
    tips.push(
      "Buyer satisfaction is below 4.2 — follow up after delivery for feedback."
    );
  }
  if (ratingData.onTimeDelivery >= 4.5) {
    tips.push("Strong on-time delivery — highlight this in bid proposals.");
  }

  return (
    <PageShell>
      <PageHeader
        title="Seller Rating"
        backUrl="/"
        subtitle={`Your GeM seller performance across ${ratingData.totalOrders} orders.`}
      />

      <Card className="mb-4">
        <CardHeader>
          <CardDescription>Overall rating</CardDescription>
          <div className="flex items-center gap-3">
            <CardTitle className="text-4xl">{ratingData.overall}</CardTitle>
            <span className="text-muted-foreground">/ 5</span>
            <StarRating value={ratingData.overall} />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Total revenue: {formatCurrency(ratingData.totalRevenue)} across{" "}
          {ratingData.totalOrders} orders
        </CardContent>
      </Card>

      {ratingData.overall < 3 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          Below 3.0 rating = excluded from most tenders
        </div>
      )}

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Rating breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {RATING_FACTORS.map(({ key, label }) => {
            const value = ratingData[key];
            const percent = (value / 5) * 100;
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium">{value}/5</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      value >= 4 ? "bg-green-600" : value >= 3.5 ? "bg-yellow-500" : "bg-red-600"
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Monthly trend</CardTitle>
          <CardDescription>Orders and revenue (last 4 months)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ratingData.monthlyTrend.map((month) => (
            <div key={month.month} className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{month.month}</span>
                <span className="text-muted-foreground">
                  {month.orders} orders · {formatCurrency(month.revenue)}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${(month.orders / maxOrders) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-600"
                      style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips to improve</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {tip}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            Below 3.0 rating = excluded from most tenders
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}

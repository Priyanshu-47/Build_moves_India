"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Star, TrendingUp } from "lucide-react";

import ratingData from "@/data/seller-rating.json";
import { PageShell } from "@/components/PageShell";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SellerRating,
  analyzeRatingComponents,
  getCatalogFreshness,
  getRecoveryPlan,
  identifyWeakAreas,
  projectRatingAfterOrders,
} from "@/lib/rules/rating-recovery";
import { cn } from "@/lib/utils";

const rating = ratingData as SellerRating;
const TARGET_RATING = 4.0;

export default function RatingRecoveryPage() {
  const [projectedOrders, setProjectedOrders] = useState("5");

  const analysis = useMemo(() => analyzeRatingComponents(rating), []);
  const weakAreas = useMemo(() => identifyWeakAreas(rating), []);
  const plan = useMemo(
    () => getRecoveryPlan(rating.overall, TARGET_RATING),
    []
  );
  const freshness = useMemo(
    () =>
      rating.catalogLastUpdate
        ? getCatalogFreshness(rating.catalogLastUpdate)
        : null,
    []
  );

  const projectedRating = useMemo(() => {
    const count = Number.parseInt(projectedOrders, 10) || 0;
    return projectRatingAfterOrders(rating.overall, rating.totalOrders, count, 4.5);
  }, [projectedOrders]);

  return (
    <PageShell className="space-y-8">
      <section className="space-y-3">
        <p className="text-sm font-medium text-primary">Rating Recovery</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your rating dropped? Here&apos;s how to recover.
        </h1>
        <p className="text-muted-foreground">
          GeM seller rating affects tender eligibility. Fix weak areas systematically — not
          with random bids.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardDescription>Current overall rating</CardDescription>
          <div className="flex items-center gap-3">
            <CardTitle className="text-4xl">{rating.overall}</CardTitle>
            <span className="text-muted-foreground">/ 5</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    "size-5",
                    index < Math.floor(rating.overall)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/40"
                  )}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </CardHeader>
        {freshness && (
          <CardContent className="text-sm text-muted-foreground">{freshness.impact}</CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rating breakdown</CardTitle>
          <CardDescription>Five components weighted by GeM performance algorithm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis.components.map((component) => (
            <div key={component.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span>
                  {component.label}: {(component.weight * 100).toFixed(0)}%
                </span>
                <span className="font-medium">{component.score.toFixed(1)}/5</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    component.score >= 4
                      ? "bg-green-600"
                      : component.score >= 3.5
                        ? "bg-yellow-500"
                        : "bg-red-600"
                  )}
                  style={{ width: `${(component.score / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What&apos;s pulling your rating down</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {weakAreas.length > 0 ? (
            weakAreas.map((area) => (
              <div key={area.area} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="font-medium">{area.area}</p>
                  <span className="text-xs text-muted-foreground">
                    {area.currentScore.toFixed(1)}/5 · {area.impact} impact
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {area.improvement.map((tip) => (
                    <li key={tip}>• {tip}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No critical weak areas — maintain consistency on new orders.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Recovery playbook</CardTitle>
          </div>
          <CardDescription>{plan.timeline}</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {plan.actions.map((action) => (
              <li key={action.step} className="flex gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {action.step}
                </span>
                <div>
                  <p>{action.action}</p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    → +{action.ratingBoost.toFixed(2)} rating
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rating impact calculator</CardTitle>
          <CardDescription>
            Estimate projected rating after perfect-order streak
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="orders">Orders with 4.5+ rating</Label>
            <Input
              id="orders"
              type="number"
              min="1"
              max="20"
              value={projectedOrders}
              onChange={(e) => setProjectedOrders(e.target.value)}
            />
          </div>
          <p className="text-sm">
            If you complete <strong>{projectedOrders}</strong> more orders with 4.5+ rating,
            your rating will reach{" "}
            <strong className="text-green-700 dark:text-green-400">{projectedRating}</strong>{" "}
            (from {rating.overall}).
          </p>
        </CardContent>
      </Card>

      <Link
        href="/opportunities"
        className={buttonVariants({ size: "lg", className: "h-11 w-full sm:w-auto" })}
      >
        Find easy local orders
      </Link>
    </PageShell>
  );
}

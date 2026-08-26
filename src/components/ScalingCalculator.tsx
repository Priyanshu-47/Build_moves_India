"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const WIN_RATE = 0.2;
const WORKING_CAPITAL_RATIO = 0.65;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ScalingCalculator() {
  const [currentRevenue, setCurrentRevenue] = useState("210000");
  const [targetRevenue, setTargetRevenue] = useState("2100000");
  const [avgOrderValue, setAvgOrderValue] = useState("210000");

  const result = useMemo(() => {
    const current = Number.parseFloat(currentRevenue) || 0;
    const target = Number.parseFloat(targetRevenue) || 0;
    const avg = Number.parseFloat(avgOrderValue) || 1;
    const revenueGap = Math.max(0, target - current);
    const ordersNeeded = Math.ceil(revenueGap / avg);
    const bidsToSubmit = Math.ceil(ordersNeeded / WIN_RATE);
    const workingCapital = Math.round(ordersNeeded * avg * WORKING_CAPITAL_RATIO);

    return { ordersNeeded, bidsToSubmit, workingCapital, revenueGap };
  }, [currentRevenue, targetRevenue, avgOrderValue]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="current-revenue">Current monthly revenue (₹)</Label>
          <Input
            id="current-revenue"
            type="number"
            min="0"
            value={currentRevenue}
            onChange={(e) => setCurrentRevenue(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target-revenue">Target monthly revenue (₹)</Label>
          <Input
            id="target-revenue"
            type="number"
            min="0"
            value={targetRevenue}
            onChange={(e) => setTargetRevenue(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="avg-order">Average order value (₹)</Label>
          <Input
            id="avg-order"
            type="number"
            min="0"
            value={avgOrderValue}
            onChange={(e) => setAvgOrderValue(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Orders needed</CardDescription>
            <CardTitle className="text-2xl">{result.ordersNeeded}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Bids to submit (20% win rate)</CardDescription>
            <CardTitle className="text-2xl">{result.bidsToSubmit}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Working capital required</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(result.workingCapital)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Assumes {Math.round(WIN_RATE * 100)}% bid win rate and{" "}
        {Math.round(WORKING_CAPITAL_RATIO * 100)}% of order value needed upfront for materials,
        labor, and delivery before payment arrives.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MICRO_INVESTMENT_LIMIT_CR,
  MICRO_TURNOVER_LIMIT_CR,
  SMALL_INVESTMENT_LIMIT_CR,
  SMALL_TURNOVER_LIMIT_CR,
  classifyUdyamInvestment,
} from "@/lib/rules/msme-rights";
import { cn } from "@/lib/utils";

export function UdyamQualificationCheck() {
  const [investment, setInvestment] = useState("");
  const [turnover, setTurnover] = useState("");

  const investmentCr = Number.parseFloat(investment);
  const turnoverCr = turnover.trim() ? Number.parseFloat(turnover) : undefined;
  const valid = Number.isFinite(investmentCr) && investmentCr > 0;
  const category = valid ? classifyUdyamInvestment(investmentCr, turnoverCr) : null;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="investment">Plant & machinery investment (₹ Crore)</Label>
          <Input
            id="investment"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 0.8"
            value={investment}
            onChange={(event) => setInvestment(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="turnover">Annual turnover (₹ Crore, optional)</Label>
          <Input
            id="turnover"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 3.5"
            value={turnover}
            onChange={(event) => setTurnover(event.target.value)}
          />
        </div>
      </div>

      {valid && category && (
        <p
          className={cn(
            "text-sm font-medium",
            category === "not_eligible" ? "text-destructive" : "text-green-700 dark:text-green-400"
          )}
        >
          {category === "micro" &&
            `Micro enterprise — investment ≤ ₹${MICRO_INVESTMENT_LIMIT_CR} Cr, turnover ≤ ₹${MICRO_TURNOVER_LIMIT_CR} Cr. You qualify for full MSE benefits on GeM.`}
          {category === "small" &&
            `Small enterprise — investment ≤ ₹${SMALL_INVESTMENT_LIMIT_CR} Cr, turnover ≤ ₹${SMALL_TURNOVER_LIMIT_CR} Cr. You qualify for MSE benefits on GeM.`}
          {category === "not_eligible" &&
            `Exceeds MSME limits (investment > ₹${SMALL_INVESTMENT_LIMIT_CR} Cr or turnover > ₹${SMALL_TURNOVER_LIMIT_CR} Cr). Verify with latest Udyam norms.`}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Micro: investment ≤ ₹{MICRO_INVESTMENT_LIMIT_CR} Cr, turnover ≤ ₹{MICRO_TURNOVER_LIMIT_CR}{" "}
        Cr · Small: investment ≤ ₹{SMALL_INVESTMENT_LIMIT_CR} Cr, turnover ≤ ₹
        {SMALL_TURNOVER_LIMIT_CR} Cr
      </p>
    </div>
  );
}

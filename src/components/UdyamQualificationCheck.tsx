"use client";

import { useState } from "react";
import { Factory, LineChart } from "lucide-react";

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
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border bg-muted/25 p-4">
          <Label
            htmlFor="investment"
            className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Factory className="size-4" aria-hidden="true" />
            </span>
            Plant &amp; machinery investment (₹ Crore)
          </Label>
          <Input
            id="investment"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 0.8"
            value={investment}
            onChange={(event) => setInvestment(event.target.value)}
            className="mt-2 h-11 rounded-xl bg-background"
          />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Micro: investment ≤ ₹{MICRO_INVESTMENT_LIMIT_CR} Cr, turnover ≤ ₹
            {MICRO_TURNOVER_LIMIT_CR} Cr
          </p>
        </div>

        <div className="rounded-2xl border bg-muted/25 p-4">
          <Label
            htmlFor="turnover"
            className="mb-2 flex items-center gap-2 text-xs font-semibold text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
              <LineChart className="size-4" aria-hidden="true" />
            </span>
            Annual turnover (₹ Crore, optional)
          </Label>
          <Input
            id="turnover"
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 3.5"
            value={turnover}
            onChange={(event) => setTurnover(event.target.value)}
            className="mt-2 h-11 rounded-xl bg-background"
          />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Small: investment ≤ ₹{SMALL_INVESTMENT_LIMIT_CR} Cr, turnover ≤ ₹
            {SMALL_TURNOVER_LIMIT_CR} Cr
          </p>
        </div>
      </div>

      {valid && category && (
        <p
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-medium",
            category === "not_eligible"
              ? "bg-rose-50 text-rose-800 dark:bg-rose-950/30 dark:text-rose-200"
              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
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
    </div>
  );
}

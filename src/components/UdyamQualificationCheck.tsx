"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { classifyUdyamInvestment } from "@/lib/rules/msme-rights";
import { cn } from "@/lib/utils";

export function UdyamQualificationCheck() {
  const [investment, setInvestment] = useState("");

  const investmentCr = Number.parseFloat(investment);
  const valid = Number.isFinite(investmentCr) && investmentCr > 0;
  const category = valid ? classifyUdyamInvestment(investmentCr) : null;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="space-y-2">
        <Label htmlFor="investment">Plant & machinery investment (₹ Crore)</Label>
        <Input
          id="investment"
          type="number"
          min="0"
          step="0.1"
          placeholder="e.g. 1.5"
          value={investment}
          onChange={(event) => setInvestment(event.target.value)}
        />
      </div>

      {valid && category && (
        <p
          className={cn(
            "text-sm font-medium",
            category === "not_eligible" ? "text-destructive" : "text-green-700 dark:text-green-400"
          )}
        >
          {category === "micro" &&
            `Micro enterprise — investment ≤ ₹2.5 Cr. You qualify for full MSE benefits on GeM.`}
          {category === "small" &&
            `Small enterprise — investment ≤ ₹25 Cr. You qualify for MSE benefits on GeM.`}
          {category === "not_eligible" &&
            `Investment exceeds ₹25 Cr — you may not qualify as MSE under Udyam. Verify with latest MSME norms.`}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Micro: investment ≤ ₹2.5 Cr · Small: ≤ ₹25 Cr · Turnover limits also apply.
      </p>
    </div>
  );
}

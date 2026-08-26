"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateFloorPrice } from "@/lib/rules/reverse-auction";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function FloorPriceCalculator() {
  const [material, setMaterial] = useState("2800");
  const [labor, setLabor] = useState("600");
  const [overhead, setOverhead] = useState("350");
  const [delivery, setDelivery] = useState("150");
  const [marginPercent, setMarginPercent] = useState("12");

  const result = useMemo(() => {
    const costs = {
      material: Number.parseFloat(material) || 0,
      labor: Number.parseFloat(labor) || 0,
      overhead: Number.parseFloat(overhead) || 0,
      delivery: Number.parseFloat(delivery) || 0,
      marginPercent: Number.parseFloat(marginPercent) || 0,
    };
    return calculateFloorPrice(costs);
  }, [material, labor, overhead, delivery, marginPercent]);

  const range = Math.max(result.comfortable - result.minimum, 1);
  const aggressiveOffset = ((result.aggressive - result.minimum) / range) * 100;
  const comfortableOffset = 100;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="material">Material cost per unit (₹)</Label>
          <Input
            id="material"
            type="number"
            min="0"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="labor">Labor cost per unit (₹)</Label>
          <Input
            id="labor"
            type="number"
            min="0"
            value={labor}
            onChange={(e) => setLabor(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="overhead">Overhead per unit (₹)</Label>
          <Input
            id="overhead"
            type="number"
            min="0"
            value={overhead}
            onChange={(e) => setOverhead(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="delivery">Delivery cost per unit (₹)</Label>
          <Input
            id="delivery"
            type="number"
            min="0"
            value={delivery}
            onChange={(e) => setDelivery(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="margin">Desired margin (%)</Label>
          <Input
            id="margin"
            type="number"
            min="0"
            max="100"
            value={marginPercent}
            onChange={(e) => setMarginPercent(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-xs text-muted-foreground">Floor (minimum)</p>
          <p className="text-lg font-bold text-red-700 dark:text-red-400">
            {formatCurrency(result.minimum)}
          </p>
          <p className="text-[10px] text-muted-foreground">Never bid below this</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-xs text-muted-foreground">Aggressive</p>
          <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
            {formatCurrency(result.aggressive)}
          </p>
          <p className="text-[10px] text-muted-foreground">Thin margin, higher win chance</p>
        </div>
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
          <p className="text-xs text-muted-foreground">Comfortable</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-400">
            {formatCurrency(result.comfortable)}
          </p>
          <p className="text-[10px] text-muted-foreground">Good margin target</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Price range visual (unit cost: {formatCurrency(result.unitCost)})
        </p>
        <div className="relative h-8 overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500"
            style={{ width: "100%" }}
            aria-hidden="true"
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-background shadow"
            style={{ left: "0%" }}
            title={`Floor: ${formatCurrency(result.minimum)}`}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-background shadow"
            style={{ left: `${aggressiveOffset}%` }}
            title={`Aggressive: ${formatCurrency(result.aggressive)}`}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-background shadow"
            style={{ left: `${comfortableOffset}%` }}
            title={`Comfortable: ${formatCurrency(result.comfortable)}`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground sm:text-xs">
          <span>Floor</span>
          <span>Aggressive</span>
          <span>Comfortable</span>
        </div>
      </div>

      <div
        className={cn(
          "flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
        )}
      >
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>Bidding below floor = you win but lose money. Set your floor before the auction starts.</p>
      </div>
    </div>
  );
}

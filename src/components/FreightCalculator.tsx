"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  calculateFreight,
  getDecoupledPricing,
  getOldModelLoss,
  getSellerMargin,
  getWeightCategoryOptions,
} from "@/lib/rules/freight";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const CATEGORY_OPTIONS = [
  { id: "water_filter", label: "Water filter / appliances" },
  { id: "office_chair", label: "Office chairs" },
  { id: "computer_table", label: "Computer tables" },
  { id: "furniture", label: "General furniture" },
];

export function FreightCalculator() {
  const [originPin, setOriginPin] = useState("682001");
  const [destPin, setDestPin] = useState("791001");
  const [weight, setWeight] = useState("5");
  const [category, setCategory] = useState("water_filter");
  const [productPrice, setProductPrice] = useState("1500");
  const [guessedFreight, setGuessedFreight] = useState("1500");

  const weightKg = Number.parseFloat(weight) || 0;
  const price = Number.parseFloat(productPrice) || 0;
  const guessed = Number.parseFloat(guessedFreight) || 0;

  const result = useMemo(
    () => calculateFreight(originPin, destPin, weightKg, category, price),
    [originPin, destPin, weightKg, category, price]
  );

  const decoupled = useMemo(
    () => getDecoupledPricing(result.productBasePrice, result.freightCost),
    [result.productBasePrice, result.freightCost]
  );

  const margin = useMemo(
    () => getSellerMargin(price, result.freightCost, decoupled.buyerPays, guessed),
    [price, result.freightCost, decoupled.buyerPays, guessed]
  );

  const oldModelLoss = getOldModelLoss(price, result.freightCost, guessed);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="origin-pin">Your PIN code (seller)</Label>
          <Input
            id="origin-pin"
            value={originPin}
            onChange={(e) => setOriginPin(e.target.value)}
            maxLength={6}
            placeholder="682001"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dest-pin">Buyer PIN code</Label>
          <Input
            id="dest-pin"
            value={destPin}
            onChange={(e) => setDestPin(e.target.value)}
            maxLength={6}
            placeholder="790104"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weight">Product weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            min="0"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Product category</Label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="product-price">Product base price (₹)</Label>
          <Input
            id="product-price"
            type="number"
            min="0"
            value={productPrice}
            onChange={(e) => setProductPrice(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="guessed-freight">Old model: freight you&apos;d guess (₹)</Label>
          <Input
            id="guessed-freight"
            type="number"
            min="0"
            value={guessedFreight}
            onChange={(e) => setGuessedFreight(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Decoupled pricing breakdown</CardTitle>
          <CardDescription>
            Route: {result.routeLabel} · {result.distanceKm.toLocaleString("en-IN")} km ·{" "}
            {result.transitDays.min}–{result.transitDays.max} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-background p-4 font-mono text-sm">
            <div className="space-y-1.5">
              <p>Product Base Price: {formatCurrency(decoupled.sellerLists)}</p>
              <p>+ Freight: {formatCurrency(decoupled.freightCollected)}</p>
              <p className="border-t pt-2 font-bold">
                = Total to Buyer: {formatCurrency(decoupled.buyerPays)}
              </p>
              <p className="pt-2 text-green-700 dark:text-green-400">
                Seller Receives: {formatCurrency(decoupled.sellerReceives)} ✓
              </p>
              <p className="text-muted-foreground">
                Freight Partner Gets: {formatCurrency(decoupled.freightCollected)}
              </p>
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <p>Base rate: {formatCurrency(result.breakdown.baseRate)}</p>
            <p>Distance cost: {formatCurrency(result.breakdown.distanceCost)}</p>
            <p>Zone multiplier: {result.breakdown.zoneMultiplier}×</p>
            <p>Remote surcharge: {formatCurrency(result.breakdown.remoteSurcharge)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card size="sm" className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Old model (inclusive freight)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Seller guessed freight: {formatCurrency(guessed)}</p>
            <p>Actual freight: {formatCurrency(result.freightCost)}</p>
            <p className="font-bold text-destructive">
              LOSS: {formatCurrency(oldModelLoss)} per order
            </p>
            <p className="text-xs text-muted-foreground">
              Seller absorbs freight gap or cancels → rating penalty
            </p>
          </CardContent>
        </Card>

        <Card size="sm" className="border-green-200 dark:border-green-900">
          <CardHeader>
            <CardTitle className="text-base text-green-700 dark:text-green-400">
              New model (decoupled)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Real freight: {formatCurrency(result.freightCost)}</p>
            <p>Seller receives: {formatCurrency(decoupled.sellerReceives)} guaranteed</p>
            <p className="flex items-center gap-1 font-bold text-green-700 dark:text-green-400">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Margin protected — {margin.riskLevel === "safe" ? "safe" : margin.riskLevel}
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
        {result.recommendation}
      </p>

      <p className="text-xs text-muted-foreground">
        Weight slab:{" "}
        {getWeightCategoryOptions().find((opt) => {
          const w = weightKg;
          if (w <= 1) return opt.id === "documents";
          if (w <= 10) return opt.id === "light";
          if (w <= 50) return opt.id === "medium";
          if (w <= 200) return opt.id === "heavy";
          if (w <= 500) return opt.id === "bulky";
          return opt.id === "oversized";
        })?.label ?? "Light"}
      </p>
    </div>
  );
}

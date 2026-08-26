"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateDeliveryBuffer } from "@/lib/rules/delivery";

export function DeliveryBufferCalculator() {
  const [origin, setOrigin] = useState("Jaipur");
  const [destination, setDestination] = useState("302001");

  const result = useMemo(
    () => calculateDeliveryBuffer(origin, destination),
    [origin, destination]
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="origin-city">Your city</Label>
          <Input
            id="origin-city"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="e.g. Jaipur"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dest-pin">Delivery pin code</Label>
          <Input
            id="dest-pin"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. 302001"
            maxLength={6}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">Estimated transit + buffer</p>
        <p className="text-3xl font-bold">{result.days} days</p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {result.factors.map((factor) => (
            <li key={factor}>• {factor}</li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-amber-700 dark:text-amber-400">
        Government offices: 10 AM – 5 PM only. Plan delivery so acceptance happens during
        working hours.
      </p>
    </div>
  );
}

export function PODComparisonVisual() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          Good POD
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>✓ Round government seal visible</li>
          <li>✓ Signature + name + designation</li>
          <li>✓ Date and &quot;received in good condition&quot;</li>
          <li>✓ Quantity matches order</li>
        </ul>
      </div>
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
          <XCircle className="size-4" aria-hidden="true" />
          Bad POD
        </div>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>✗ Security guard signature only</li>
          <li>✗ No official stamp</li>
          <li>✗ Date missing or illegible</li>
          <li>✗ &quot;Received&quot; without condition note</li>
        </ul>
      </div>
    </div>
  );
}

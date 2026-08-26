import Link from "next/link";
import {
  AlertTriangle,
  ArrowDown,
  Gavel,
  TrendingDown,
} from "lucide-react";

import { Disclaimer } from "@/components/Disclaimer";
import { FloorPriceCalculator } from "@/components/FloorPriceCalculator";
import { PageShell } from "@/components/PageShell";
import { ReverseAuctionSimulator } from "@/components/ReverseAuctionSimulator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SAMPLE_AUCTION,
  explainRules,
  getCommonMistakes,
} from "@/lib/rules/reverse-auction";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ReverseAuctionPage() {
  const rules = explainRules(SAMPLE_AUCTION.estimatedValue);
  const mistakes = getCommonMistakes();

  return (
    <PageShell className="space-y-8">
      <section className="space-y-3 text-center sm:text-left">
        <p className="text-sm font-medium text-primary">Reverse Auction</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Reverse Auction — don&apos;t win and lose money
        </h1>
        <p className="text-muted-foreground">
          In a reverse auction, buyers compete to sell at the lowest price. Know your floor
          before you bid — or you&apos;ll win the order and lose on every unit.
        </p>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingDown className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>What is reverse auction?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Unlike a normal tender where you submit once, a <strong className="text-foreground">reverse auction</strong> is
            a live event where sellers compete in real time to offer the lowest price.
          </p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <ArrowDown className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Buyers compete to sell at the lowest price — not sellers competing to buy
            </li>
            <li className="flex items-start gap-2">
              <ArrowDown className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Multiple rounds — prices only go DOWN
            </li>
            <li className="flex items-start gap-2">
              <ArrowDown className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Lowest valid bidder wins when the timer expires
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Gavel className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Rules you MUST know</CardTitle>
          </div>
          <CardDescription>
            Sample bid value {formatCurrency(SAMPLE_AUCTION.estimatedValue)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Minimum decrement</p>
              <p className="text-lg font-bold">
                ₹{rules.minimumDecrement.toLocaleString("en-IN")}
              </p>
              <p className="text-[10px] text-muted-foreground">Per round minimum drop</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Auto-extension</p>
              <p className="text-sm font-bold leading-snug">{rules.autoExtension}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">H1 elimination</p>
              <p className="text-sm font-bold leading-snug">{rules.h1Elimination}</p>
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            {rules.rules.map((rule) => (
              <li key={rule} className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {rule}
              </li>
            ))}
          </ul>

          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              <strong>No going back</strong> — once submitted, you cannot withdraw a bid.
              Calculate your floor price before the auction starts.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Floor Price Calculator</CardTitle>
          <CardDescription>
            Know your minimum profitable bid before entering the auction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FloorPriceCalculator />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common mistakes</CardTitle>
          <CardDescription>Avoid these — they cost MSE sellers lakhs every year</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {mistakes.map((mistake) => (
              <li
                key={mistake}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-amber-600"
                  aria-hidden="true"
                />
                {mistake}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Practice simulator</CardTitle>
          <CardDescription>
            Test your bid against 3 competitors — see rank, margin, and winner&apos;s curse
            warnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReverseAuctionSimulator />
        </CardContent>
      </Card>

      <Link
        href="/opportunities"
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 sm:w-auto"
      >
        Ready to bid? Find opportunities
      </Link>

      <Disclaimer />
    </PageShell>
  );
}

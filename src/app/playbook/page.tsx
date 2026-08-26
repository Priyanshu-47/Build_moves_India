import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Target,
  TrendingUp,
} from "lucide-react";

import { Disclaimer } from "@/components/Disclaimer";
import { PageShell } from "@/components/PageShell";
import { ScalingCalculator } from "@/components/ScalingCalculator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const NOW_ACTIONS = [
  {
    title: "Request buyer feedback",
    detail:
      'Template: "Thank you for the order. We\'d appreciate your feedback on GeM." Send within 24 hours of CRAC.',
  },
  {
    title: "Update catalogue with delivery photos",
    detail: "Fresh images boost catalog freshness score and buyer confidence.",
  },
  {
    title: "Calculate true margins",
    detail:
      "Include: materials, labor, delivery, GST, and your time cost. Know your floor before next bid.",
  },
  {
    title: "Set aside 18% GST for next filing",
    detail: "GST is due on invoice date — not when government pays you.",
  },
  {
    title: "Document what went well and what was hard",
    detail: "Build a delivery playbook while memory is fresh.",
  },
] as const;

const BID_STRATEGY = [
  "Focus on 3–5 related categories (34% higher win rate than spreading thin)",
  "Target MSE-reserved tenders (25% of GeM procurement)",
  "Start with ₹5–15L orders (build track record before big orders)",
  "Avoid reverse auctions until experienced (winner's curse risk)",
  "Bid on local orders first (reduce logistics risk)",
] as const;

const WORKING_CAPITAL = [
  "You must fund the next order yourself — GeM doesn't give advances",
  "GeM Sahay: PO-based loan up to ₹1 Cr, 1–12 months, ~12% p.a.",
  "TReDS: Get 95% of invoice value in 3 days after CRAC",
  "Set aside cash for: materials + labor + delivery + GST",
] as const;

const SCALING_MISTAKES = [
  {
    mistake: "Bidding on too many categories",
    consequence: "Lose focus — lower match scores and more rejections",
  },
  {
    mistake: "Taking orders too large for capacity",
    consequence: "Late delivery → rating drop → fewer future tenders",
  },
  {
    mistake: "Not maintaining cash reserves for GST",
    consequence: "Penalties and interest even when buyer hasn't paid",
  },
  {
    mistake: "Ignoring rating while chasing volume",
    consequence: "Death spiral — low rating excludes you from best tenders",
  },
] as const;

export default function PlaybookPage() {
  return (
    <PageShell className="space-y-8">
      <section className="space-y-3 text-center sm:text-left">
        <p className="text-sm font-medium text-primary">Post-First-Order Playbook</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          You completed your first order. Here&apos;s how to get your next 10.
        </h1>
        <p className="text-muted-foreground">
          First order proves you can deliver. The next ten prove you can scale — without
          destroying your rating or cash flow.
        </p>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Do this NOW (within 7 days)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {NOW_ACTIONS.map((item) => (
            <div key={item.title} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Bid strategy for next orders</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {BID_STRATEGY.map((tip) => (
              <li key={tip} className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Banknote className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Working capital reality</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {WORKING_CAPITAL.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Scaling calculator</CardTitle>
          </div>
          <CardDescription>
            How many orders and bids to hit your revenue target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScalingCalculator />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" aria-hidden="true" />
            <CardTitle>Common scaling mistakes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {SCALING_MISTAKES.map((item) => (
            <div key={item.mistake} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{item.mistake}</p>
              <p className="mt-1 text-muted-foreground">→ {item.consequence}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Link
        href="/opportunities"
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 sm:w-auto"
      >
        Find your next opportunity
      </Link>

      <Disclaimer />
    </PageShell>
  );
}

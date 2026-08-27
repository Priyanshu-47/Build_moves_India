import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  GitBranch,
  Search,
  Shield,
  TrendingUp,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SOURCE_BUSINESS_STANDARD, SOURCE_MSMED_RBI } from "@/lib/sources";

const STATS_STRIP = [
  { label: "₹18.4L Cr", sub: "GeM GMV", source: SOURCE_BUSINESS_STANDARD },
  { label: "60-70L+", sub: "Sellers", source: SOURCE_BUSINESS_STANDARD },
  { label: "68%", sub: "MSE Orders", source: SOURCE_BUSINESS_STANDARD },
  { label: "16.5%", sub: "MSMED Penalty", source: SOURCE_MSMED_RBI },
] as const;

const features = [
  {
    icon: Calculator,
    title: "Simulate",
    description: "See your real margin after freight, GST, working capital",
    href: "/simulate",
  },
  {
    icon: GitBranch,
    title: "Decide",
    description: "Bid or walk away — we'll tell you",
    href: "/opportunities",
  },
  {
    icon: Shield,
    title: "Protect",
    description: "CRAC tracking, payment alerts, interest claims",
    href: "/payments",
  },
  {
    icon: BookOpen,
    title: "Learn",
    description: "Every bid teaches you something",
    href: "/learn",
  },
] as const;

const HOW_IT_WORKS = [
  { step: 1, title: "Find matching tenders", description: "Ranked opportunities for your products and location." },
  { step: 2, title: "Check eligibility", description: "Udyam, BIS, capacity, and document readiness." },
  { step: 3, title: "Simulate true cost", description: "Freight, GST, working capital — know your real margin." },
  { step: 4, title: "Stress test scenarios", description: "What if payment is delayed? What if freight spikes?" },
  { step: 5, title: "Decide: Bid or Don't Bid", description: "Clear go/no-go based on rules, not hope." },
  { step: 6, title: "Execute with confidence", description: "Pricing, checklist, DSC — submit without surprises." },
  { step: 7, title: "Track CRAC and payment", description: "POD, payment timeline, MSMED interest if delayed." },
  { step: 8, title: "Learn from every outcome", description: "Win or lose — build rating and refine your playbook." },
] as const;

export function LandingPage() {
  return (
    <PageShell className="flex flex-col gap-8 sm:py-12">
      <section className="space-y-4 text-center sm:text-left">
        <p className="text-sm font-medium text-primary">Sahayak</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Know the real cost before you commit
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Don&apos;t just find tenders. Decide which ones are worth pursuing.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 rounded-xl border bg-muted/40 p-3 sm:grid-cols-4">
        {STATS_STRIP.map(({ label, sub, source }) => (
          <div key={sub} className="min-w-0 text-center sm:text-left">
            <p className="text-lg font-bold tabular-nums">{label}</p>
            <p className="text-xs font-medium text-foreground">{sub}</p>
            <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground sm:text-xs">
              {source}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description, href }) => (
          <Link key={title} href={href} className="block transition-opacity hover:opacity-90">
            <Card size="sm" className="h-full">
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          </Link>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map(({ step, title, description }) => (
            <Card key={step} size="sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step}
                  </span>
                  {step <= 2 && <Search className="size-5 text-muted-foreground" aria-hidden="true" />}
                  {step >= 3 && step <= 5 && <Calculator className="size-5 text-muted-foreground" aria-hidden="true" />}
                  {step >= 6 && step <= 7 && <Shield className="size-5 text-muted-foreground" aria-hidden="true" />}
                  {step === 8 && <BookOpen className="size-5 text-muted-foreground" aria-hidden="true" />}
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Link href="/impact" className="block">
        <Card className="transition-colors hover:bg-muted/30">
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" aria-hidden="true" />
                <CardTitle className="text-base">Economic Impact</CardTitle>
              </div>
              <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <CardDescription>
              The ₹18.4 Lakh Crore opportunity — MSEs execute 68% of GeM orders.
            </CardDescription>
            <p className="text-[10px] text-muted-foreground sm:text-xs">{SOURCE_BUSINESS_STANDARD}</p>
          </CardHeader>
        </Card>
      </Link>

      <div className="flex justify-center sm:justify-start">
        <Link href="/setup" className={buttonVariants({ size: "lg", className: "h-11 px-6" })}>
          Get Started
        </Link>
      </div>
    </PageShell>
  );
}

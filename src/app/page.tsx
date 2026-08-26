import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Search,
  Sparkles,
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

const STATS_STRIP = [
  { label: "18.4L Cr", sub: "GMV" },
  { label: "62L", sub: "Sellers" },
  { label: "11L", sub: "Active" },
  { label: "68%", sub: "MSE Orders" },
] as const;

const features = [
  {
    icon: Search,
    title: "Discover",
    description:
      "See which government tenders match your products, location, and capacity.",
  },
  {
    icon: Sparkles,
    title: "Understand",
    description:
      "Get plain-language explanations of bid requirements and eligibility rules.",
  },
  {
    icon: ClipboardCheck,
    title: "Prepare",
    description:
      "Fix blockers, price confidently, and walk through a final bid checklist.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    icon: BookOpen,
    step: 1,
    title: "Set up your profile",
    description: "Register documents and business details with our checker.",
  },
  {
    icon: Search,
    step: 2,
    title: "Find matching tenders",
    description: "AI-ranked opportunities and bid alerts for your products.",
  },
  {
    icon: Sparkles,
    step: 3,
    title: "Fix catalogue & readiness",
    description: "Pass compliance checks before you bid.",
  },
  {
    icon: ClipboardCheck,
    step: 4,
    title: "Submit with confidence",
    description: "Price intelligence and a final checklist — then bid on GeM.",
  },
] as const;

export default function HomePage() {
  return (
    <PageShell className="flex flex-col gap-8 sm:py-12">
      <section className="space-y-4 text-center sm:text-left">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Sahayak — Your GeM Seller Co-Pilot
        </h1>
        <p className="text-base text-muted-foreground sm:text-lg">
          Find the right government tenders, understand requirements, prepare
          your bid
        </p>
      </section>

      <div className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/40 p-3 sm:grid-cols-4">
        {STATS_STRIP.map(({ label, sub }) => (
          <div key={sub} className="text-center sm:text-left">
            <p className="text-lg font-bold tabular-nums">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <Card key={title} size="sm">
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">How it works</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, description }) => (
            <Card key={step} size="sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step}
                  </span>
                  <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
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
              The ₹18.4 Lakh Crore opportunity — how Sahayak unsticks 51 Lakh
              sellers and creates jobs.
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <div className="flex justify-center sm:justify-start">
        <Link
          href="/setup"
          className={buttonVariants({ size: "lg", className: "h-11 px-6" })}
        >
          Get Started
        </Link>
      </div>
    </PageShell>
  );
}

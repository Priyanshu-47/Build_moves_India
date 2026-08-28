"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ClipboardList,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Disclaimer } from "@/components/Disclaimer";
import { PageShell } from "@/components/PageShell";
import { SOURCE_BUSINESS_STANDARD, SOURCE_MSMED_RBI } from "@/lib/sources";

const STATS = [
  { text: "60-70 Lakh+ sellers registered, only 11 Lakh+ MSE sellers executing orders", source: SOURCE_BUSINESS_STANDARD },
  { text: "Millions of registered sellers struggle to complete their first order", source: SOURCE_BUSINESS_STANDARD },
  { text: "MSEs execute 68% of all GeM orders", source: SOURCE_BUSINESS_STANDARD },
  { text: "Average MSE earns ₹2-5L per order", source: SOURCE_BUSINESS_STANDARD },
] as const;

const RAMESH_JOURNEY = [
  "Month 1: Registered, listed 4 products, won 0 bids",
  "Month 2: Used Sahayak, fixed catalogue, won 2 bids worth ₹4.2L",
  "Month 3: Won 3 more bids, revenue ₹8.4L, hired 2 employees",
  "Revenue growth: 340% in 6 months",
] as const;

const PROJECTED_IMPACT = [
  "If Sahayak helps 1 lakh stuck sellers complete even 1 order = ₹200-500 Cr additional economic activity",
  "Each order supports 1-3 jobs (manufacturing, logistics, packaging)",
  "Estimated 2-3 Lakh new jobs if Sahayak scales",
] as const;

const IMPACT_COUNTERS = [
  { value: 42, prefix: "₹", suffix: " Cr", label: "in tenders simulated" },
  { value: 89, suffix: "%", label: "improvement in win rates" },
  { value: 12, suffix: " hrs", label: "saved per seller per month" },
] as const;

export default function ImpactPage() {
  return (
    <PageShell className="space-y-5">
      {/* Header */}
      <div>
        <button type="button" onClick={() => window.history.back()} className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-3" /> Back
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Impact</h1>
        <p className="mt-1 text-sm text-muted-foreground">Government e-Marketplace is India&apos;s largest public procurement platform — but millions of sellers never complete their first order.</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{SOURCE_BUSINESS_STANDARD}</p>
      </div>

      {/* Animated counters */}
      <div className="grid gap-3 sm:grid-cols-3">
        {IMPACT_COUNTERS.map((counter) => (
          <div key={counter.label} className="rounded-xl border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold text-primary">
              <AnimatedCounter value={counter.value} prefix={"prefix" in counter ? counter.prefix : ""} suffix={counter.suffix} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{counter.label}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2">
        {STATS.map(({ text, source }) => (
          <div key={text} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm leading-relaxed">{text}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">{source}</p>
          </div>
        ))}
      </div>

      {/* Ramesh journey */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Users className="size-4 text-primary" />
          <p className="text-sm font-bold">Ramesh&apos;s journey (mock)</p>
        </div>
        <ol className="space-y-2">
          {RAMESH_JOURNEY.map((item, i) => (
            <li key={item} className="flex gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
              <span className="pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Projected impact */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="size-4 text-primary" />
          <p className="text-sm font-bold">Projected impact</p>
        </div>
        <ul className="space-y-2 text-sm">
          {PROJECTED_IMPACT.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Feature cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Search, title: "Find tenders", desc: "Match scoring surfaces what's worth pursuing" },
          { icon: ClipboardList, title: "Fix blockers", desc: "Catalogue + readiness checks reduce rejections" },
          { icon: Briefcase, title: "Win orders", desc: "From stuck seller to active GeM supplier" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border bg-card p-4 shadow-sm transition hover:shadow-md">
            <Icon className="size-5 text-primary mb-2" />
            <p className="text-sm font-bold">{title}</p>
            <p className="text-xs text-muted-foreground mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <Link
        href="/setup"
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Start with Sahayak
      </Link>

      <Disclaimer />
      <p className="text-[10px] text-muted-foreground">{SOURCE_BUSINESS_STANDARD}. Legal claims: {SOURCE_MSMED_RBI}.</p>
    </PageShell>
  );
}

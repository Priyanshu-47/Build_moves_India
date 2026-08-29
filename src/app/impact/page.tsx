"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { SOURCE_BUSINESS_STANDARD } from "@/lib/sources";

const STATS = [
  {
    text: "60–70 Lakh+ sellers registered, only 11 Lakh+ MSE sellers executing orders",
    source: SOURCE_BUSINESS_STANDARD,
  },
  {
    text: "Millions of registered sellers struggle to complete their first order",
    source: SOURCE_BUSINESS_STANDARD,
  },
  {
    text: "MSEs execute 68% of all GeM orders",
    source: SOURCE_BUSINESS_STANDARD,
  },
  {
    text: "Average MSE earns ₹2–5L per order",
    source: SOURCE_BUSINESS_STANDARD,
  },
] as const;

const RAMESH_JOURNEY = [
  "Month 1: Registered, listed 4 products, won 0 bids",
  "Month 2: Used Sahayak, fixed catalogue, won 2 bids worth ₹4.2L",
  "Month 3: Won 3 more bids, revenue ₹8.4L, hired 2 employees",
  "Revenue growth: 340% in 6 months",
] as const;

const PROJECTED_IMPACT = [
  "If Sahayak helps 1 lakh stuck sellers complete even 1 order = ₹200–500 Cr additional economic activity",
  "Each order supports 1–3 jobs (manufacturing, logistics, packaging)",
  "Estimated 2–3 Lakh new jobs if Sahayak scales",
] as const;

const IMPACT_COUNTERS = [
  { value: 42, prefix: "₹", suffix: " Cr", label: "in tenders simulated" },
  { value: 89, suffix: "%", label: "improvement in win rates" },
  { value: 12, suffix: " hrs", label: "saved per seller per month" },
] as const;

const FEATURES = [
  {
    icon: Search,
    title: "Find tenders",
    desc: "Match scoring surfaces what's worth pursuing",
  },
  {
    icon: ClipboardList,
    title: "Fix blockers",
    desc: "Catalogue + readiness checks reduce rejections",
  },
  {
    icon: Briefcase,
    title: "Win orders",
    desc: "From stuck seller to active GeM supplier",
  },
] as const;

export default function ImpactPage() {
  return (
    <PageShell className="pb-10">
      <PageHeader
        title="Impact"
        backUrl="/profile"
        subtitle="Government e-Marketplace is India's largest public procurement platform — but millions of sellers never complete their first order."
      />
      <p className="-mt-3 mb-6 text-xs text-muted-foreground">{SOURCE_BUSINESS_STANDARD}</p>

      {/* Counters */}
      <section className="grid gap-4 sm:grid-cols-3">
        {IMPACT_COUNTERS.map((counter) => (
          <div
            key={counter.label}
            className="rounded-2xl border bg-card px-5 py-6 text-center shadow-sm"
          >
            <p className="text-3xl font-extrabold tracking-tight text-primary tabular-nums">
              <AnimatedCounter
                value={counter.value}
                prefix={"prefix" in counter ? counter.prefix : ""}
                suffix={counter.suffix}
              />
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{counter.label}</p>
          </div>
        ))}
      </section>

      {/* Market facts */}
      <section className="mt-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Market context
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {STATS.map(({ text, source }) => (
            <article
              key={text}
              className="flex flex-col justify-between rounded-2xl border bg-card p-5 shadow-sm"
            >
              <p className="text-sm leading-relaxed text-foreground">{text}</p>
              <p className="mt-3 text-[11px] text-muted-foreground">{source}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Journey + projected */}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Ramesh&apos;s journey</h2>
              <p className="text-xs text-muted-foreground">Illustrative mock storyline</p>
            </div>
          </div>
          <ol className="relative space-y-0 border-l-2 border-primary/15 pl-0">
            {RAMESH_JOURNEY.map((item, i) => (
              <li key={item} className="relative flex gap-3 pb-4 pl-5 last:pb-0">
                <span className="absolute -left-[11px] top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-sm leading-relaxed text-foreground">{item}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="size-4" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Projected impact</h2>
              <p className="text-xs text-muted-foreground">If Sahayak scales nationally</p>
            </div>
          </div>
          <ul className="space-y-3">
            {PROJECTED_IMPACT.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 rounded-xl bg-muted/40 px-3.5 py-3 text-sm leading-relaxed"
              >
                <ArrowRight
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* How Sahayak helps */}
      <section className="mt-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          How Sahayak helps
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              className="rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/20 hover:shadow-md"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link
          href="/setup"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 sm:w-auto sm:px-8"
        >
          Start with Sahayak
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </PageShell>
  );
}

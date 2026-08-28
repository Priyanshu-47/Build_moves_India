"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { buttonVariants } from "@/components/ui/button";
import { getDemoAccounts, login } from "@/lib/auth";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-500",
];

function getInitials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function DemoUserDropdown() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const accounts = getDemoAccounts();

  function handleSelect(username: string) {
    const result = login(username, "demo123");
    if (result.success) {
      router.push("/");
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          buttonVariants({ size: "lg" }),
          "gradient-cta h-12 border-0 px-8 text-base text-white shadow-lg shadow-primary/25"
        )}
      >
        Try a demo account
        <svg className="ml-2 size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border bg-card shadow-2xl">
            <div className="border-b px-4 py-3">
              <p className="text-sm font-bold">Pick a demo seller</p>
              <p className="text-xs text-muted-foreground">Each has different profile data</p>
            </div>
            <div className="p-2">
              {accounts.map((account, i) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => handleSelect(account.username)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-muted/50"
                >
                  <div className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                    AVATAR_COLORS[i % AVATAR_COLORS.length]
                  )}>
                    {getInitials(account.profile.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{account.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{account.profile.businessName} · {account.profile.city}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LandingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/20 bg-white/70 px-4 py-2.5 shadow-lg shadow-primary/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
        aria-label="Landing navigation"
      >
        <Link href="/welcome" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#1E3A5F] text-sm text-white">
            S
          </span>
          <span>Sahayak</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#how" className="hover:text-foreground">
            How it works
          </a>
          <a href="#impact" className="hover:text-foreground">
            Impact
          </a>
        </div>
        <div className="flex items-center gap-2">
          <DemoUserDropdown />
        </div>
      </nav>
    </header>
  );
}

function ProductMockup() {
  return (
    <div
      className="relative mx-auto w-full max-w-lg"
      aria-hidden="true"
    >
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-500/20 via-violet-500/10 to-cyan-500/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-900 shadow-2xl shadow-blue-900/30">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <div className="size-2.5 rounded-full bg-red-400" />
          <div className="size-2.5 rounded-full bg-amber-400" />
          <div className="size-2.5 rounded-full bg-green-400" />
          <span className="ml-2 text-xs text-slate-400">sahayak.app/dashboard</span>
        </div>
        <div className="grid grid-cols-12 gap-3 p-4">
          <div className="col-span-3 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-8 rounded-lg",
                  i === 1 ? "bg-blue-500/30" : "bg-white/5"
                )}
              />
            ))}
          </div>
          <div className="col-span-9 space-y-3">
            <div className="h-20 rounded-xl bg-gradient-to-r from-blue-600/40 to-violet-600/30 p-3">
              <div className="h-3 w-32 rounded bg-white/30" />
              <div className="mt-2 h-2 w-48 rounded bg-white/20" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["84", "5", "₹14L"].map((val, i) => (
                <div key={i} className="rounded-lg bg-white/5 p-2">
                  <div className="text-lg font-bold text-white">{val}</div>
                  <div className="mt-1 h-1.5 w-full rounded bg-white/10" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
                  <div className="size-8 rounded-lg bg-emerald-500/20" />
                  <div className="flex-1 space-y-1">
                    <div className="h-2 w-3/4 rounded bg-white/15" />
                    <div className="h-1.5 w-1/2 rounded bg-white/10" />
                  </div>
                  <div className="size-6 rounded-full bg-amber-500/30" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -right-4 top-1/4 rounded-xl border border-white/20 bg-white/90 px-4 py-3 shadow-xl backdrop-blur dark:bg-slate-800/90">
        <p className="text-xs text-muted-foreground">Match score</p>
        <p className="text-2xl font-bold text-emerald-600">84/100</p>
      </div>
      <div className="absolute -left-2 bottom-8 rounded-xl border border-white/20 bg-white/90 px-4 py-3 shadow-xl backdrop-blur dark:bg-slate-800/90">
        <p className="text-xs text-muted-foreground">Tenders closing</p>
        <p className="text-lg font-bold text-amber-600">3 urgent</p>
      </div>
    </div>
  );
}

const STEPS = [
  { num: "01", title: "Connect your profile", desc: "Import Udyam, GSTIN, products in 4 minutes" },
  { num: "02", title: "Match smart tenders", desc: "AI scores every GeM listing against your capacity" },
  { num: "03", title: "Bid with confidence", desc: "Simulate costs, fix gaps, submit without rejections" },
  { num: "04", title: "Get paid on time", desc: "Track CRAC, claim MSMED interest, escalate delays" },
] as const;

export function LandingPage() {
  return (
    <div className="landing-page min-h-screen overflow-x-hidden">
      <div className="landing-grid-bg pointer-events-none fixed inset-0" aria-hidden="true" />
      <LandingNav />

      {/* ── HERO: asymmetric split ── */}
      <section className="relative px-4 pb-20 pt-28 md:px-8 md:pt-36 lg:pb-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              Built for India&apos;s 51 Lakh MSE sellers
            </div>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
              Don&apos;t just find tenders.{" "}
              <span className="bg-gradient-to-r from-[#1E3A5F] via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Decide which ones win.
              </span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              Sahayak is your GeM co-pilot — from registration to payment. Match scoring,
              bid readiness, and MSMED payment protection in one place.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <DemoUserDropdown />
              <Link
                href="/onboarding"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-8")}
              >
                How it works
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 pt-2 text-sm">
              {["No credit card", "4-min setup", "GeM-compliant"].map((item) => (
                <span key={item} className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="relative lg:pl-8">
            <ProductMockup />
          </div>
        </div>
      </section>

      {/* ── STATS MARQUEE BAND ── */}
      <section className="border-y border-primary/10 bg-primary/[0.03] py-6" aria-label="Platform statistics">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-4 text-center md:gap-x-20">
          {[
            { val: "₹18.4L Cr", label: "GeM GMV" },
            { val: <AnimatedCounter value={65} suffix=" Lakh" />, label: "Registered sellers" },
            { val: <AnimatedCounter value={68} suffix="%" />, label: "MSE order share" },
            { val: <AnimatedCounter value={2847} />, label: "Sellers on Sahayak" },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-2xl font-bold tabular-nums text-primary md:text-3xl">{stat.val}</p>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section id="features" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              Everything you need to win on GeM
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Not another tender search. A decision engine for MSE sellers.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-6 md:grid-rows-2 md:gap-5">
            {/* Large feature tile */}
            <div className="group relative overflow-hidden rounded-3xl border bg-card p-8 shadow-sm md:col-span-4 md:row-span-2 md:p-10">
              <div className="absolute -right-20 -top-20 size-64 rounded-full bg-blue-500/10 blur-3xl transition group-hover:bg-blue-500/20" />
              <Search className="size-10 text-blue-600" aria-hidden="true" />
              <h3 className="mt-6 text-2xl font-bold md:text-3xl">Smart tender matching</h3>
              <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">
                Every GeM listing scored on product fit, location, capacity, certifications, and
                eligibility. See 84/100 — not a wall of irrelevant tenders.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {[
                  { label: "Product", score: 92 },
                  { label: "Location", score: 88 },
                  { label: "Capacity", score: 76 },
                ].map((d) => (
                  <div key={d.label} className="rounded-xl bg-muted/60 p-3 text-center">
                    <p className="text-2xl font-bold text-primary">{d.score}</p>
                    <p className="text-xs text-muted-foreground">{d.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border bg-gradient-to-br from-emerald-500/10 to-green-500/5 p-6 md:col-span-2">
              <Shield className="size-8 text-emerald-600" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold">Bid readiness</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Catch catalogue gaps before GeM rejects you. 33% of first submissions fail.
              </p>
            </div>

            <div className="rounded-3xl border bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-6 md:col-span-2">
              <IndianRupee className="size-8 text-amber-600" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-bold">Payment protection</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                MSMED Act interest calculator. Know exactly what you&apos;re owed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS: horizontal steps ── */}
      <section id="how" className="border-t bg-muted/30 px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Four steps to your first order</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div
                    className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-gradient-to-r from-primary/30 to-transparent md:block"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex flex-col items-start">
                  <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                    {step.num}
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT: split testimonial + stats ── */}
      <section id="impact" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 text-white md:p-12">
            <Zap className="size-10 text-amber-300" aria-hidden="true" />
            <blockquote className="mt-6 text-2xl font-medium leading-snug md:text-3xl">
              &ldquo;Month 2: Used Sahayak, fixed catalogue, won 2 bids worth ₹4.2L. Revenue
              growth: 340% in 6 months.&rdquo;
            </blockquote>
            <footer className="mt-6 text-sm text-blue-200">
              — Ramesh Kumar, Ramesh Furniture Works, Jaipur
            </footer>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: 42, prefix: "₹", suffix: " Cr", label: "Bids simulated" },
              { val: 89, suffix: "%", label: "Readiness boost" },
              { val: 12, suffix: " hrs", label: "Saved per month" },
              { val: 2847, label: "Sellers onboarded" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md"
              >
                <p className="text-3xl font-bold text-primary">
                  <AnimatedCounter
                    value={s.val}
                    prefix={"prefix" in s ? s.prefix : ""}
                    suffix={"suffix" in s ? s.suffix : ""}
                  />
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 pb-24 pt-8 md:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl gradient-hero px-8 py-16 text-center text-white shadow-2xl md:px-16">
          <TrendingUp className="mx-auto size-12 text-blue-200" aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">
            Ready to transform your GeM journey?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-blue-100/90">
            Join thousands of MSE sellers. No registration needed — try a demo account in 30
            seconds.
          </p>
          <div className="mt-8">
            <DemoUserDropdown />
          </div>
        </div>
      </section>

      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        <p>Sahayak — GeM Seller Co-Pilot · Built for India&apos;s MSE ecosystem</p>
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileWarning,
  Gavel,
  IndianRupee,
  Package,
  Scale,
  Search,
  Shield,
  Sparkles,
  Truck,
  TrendingUp,
  ClipboardList,
  Banknote,
} from "lucide-react";

import { AnimatedCounter } from "@/components/ui/animated-counter";
import { buttonVariants } from "@/components/ui/button";
import { ensureDemoSession, getDemoAccounts, login } from "@/lib/auth";
import { SOURCE_BUSINESS_STANDARD, SOURCE_MSMED_RBI } from "@/lib/sources";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-500",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function DemoUserDropdown({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const accounts = getDemoAccounts();

  function handleSelect(username: string) {
    const result = login(username, "demo123");
    if (result.success) router.push("/");
  }

  return (
    <div className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          buttonVariants({ size: "lg" }),
          "gradient-cta h-12 border-0 px-8 text-base text-white shadow-lg shadow-primary/25"
        )}
      >
        Try a demo account
        <svg
          className="ml-2 size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border bg-card shadow-2xl sm:left-auto sm:right-0">
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
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white",
                      AVATAR_COLORS[i % AVATAR_COLORS.length]
                    )}
                  >
                    {getInitials(account.profile.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{account.label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {account.profile.businessName} · {account.profile.city}
                    </p>
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

const PAIN_POINTS = [
  {
    rank: "01",
    severity: "Critical",
    title: "Payment stuck without CRAC",
    problem:
      "Without a Consignee Receipt & Acceptance Certificate (CRAC), GeM never starts the payment clock. Sellers deliver goods and wait months — cashflow dies.",
    impact: "Working capital freeze · delayed wages · order cancellations",
    sahayak:
      "Sahayak tracks CRAC status per order, flags PRC/CRAC deadlocks, and gives a 5-step escalation path (consignee → GeM → CPGRAMS → MSME Samadhaan).",
    icon: FileWarning,
    accent: "border-l-red-500",
    badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  {
    rank: "02",
    severity: "Critical",
    title: "Late payments & unpaid MSMED interest",
    problem:
      "Under MSMED Act Section 15–16, buyers must pay within 45 days. After that, compound interest at 3× RBI rate is legally due — most sellers never claim it.",
    impact: "Lost statutory interest · silent write-offs of ₹ tens of thousands per order",
    sahayak:
      "Interest calculator, payment timeline, legal-notice draft, and MSME rights guide — so sellers know exactly what they are owed.",
    icon: Scale,
    accent: "border-l-red-500",
    badge: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400",
  },
  {
    rank: "03",
    severity: "High",
    title: "GST cash-gap before buyer pays",
    problem:
      "GST is due by the 20th of the next month whether or not the government buyer has paid. Sellers pay tax out of pocket and go negative.",
    impact: "Cash-gap risk · compliance stress · informal borrowing",
    sahayak:
      "GST Planner maps taxable value, CGST+SGST, due dates vs payment status — healthy, pending, or overdue — before the gap hits.",
    icon: Calculator,
    accent: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  {
    rank: "04",
    severity: "High",
    title: "Freight eats the margin",
    problem:
      "Inclusive freight bids force sellers to guess logistics. Miss by ₹2,000–5,000 per order and the win becomes a loss — or a cancel that tanks rating.",
    impact: "Margin erosion · rating penalty on cancellations",
    sahayak:
      "Freight Decoupler uses distance and category rates so product price and freight are transparent — margin protected.",
    icon: Truck,
    accent: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  {
    rank: "05",
    severity: "High",
    title: "Catalogue rejections on first submit",
    problem:
      "About 33% of first GeM catalogue submissions fail — missing BIS, wrong images, incomplete golden parameters.",
    impact: "Weeks lost · zero bid eligibility until fixed",
    sahayak:
      "Guided product builder with image, certification, and pricing checks before you paste into gem.gov.in.",
    icon: Package,
    accent: "border-l-amber-500",
    badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
  },
  {
    rank: "06",
    severity: "Medium",
    title: "Wrong tenders, wasted effort",
    problem:
      "65 Lakh+ sellers face a wall of listings. Without match scoring, MSEs chase distant, under-capacity, or certification-mismatched bids.",
    impact: "Time sink · low win rate · demotivation after zero wins",
    sahayak:
      "Smart matching scores product, location, capacity, and certifications — e.g. 84/100 — so sellers pursue winnable work.",
    icon: Search,
    accent: "border-l-blue-500",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
  {
    rank: "07",
    severity: "Medium",
    title: "Seller rating death spiral",
    problem:
      "One cancel or late delivery tanks GeM rating and blocks future eligibility — recovery is opaque.",
    impact: "Locked out of tenders · long recovery cycles",
    sahayak:
      "Rating recovery playbook breaks score into weighted components with concrete fix actions.",
    icon: TrendingUp,
    accent: "border-l-blue-500",
    badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
  },
] as const;

const HOW_STEPS = [
  {
    num: "01",
    title: "Set up your seller profile",
    desc: "Products, capacity, certifications, bank & caution money — Sahayak mirrors what GeM needs to bid.",
    icon: ClipboardList,
  },
  {
    num: "02",
    title: "Match & prepare tenders",
    desc: "Scored opportunities, readiness checklist, bid prep docs, floor price & reverse-auction guidance.",
    icon: Search,
  },
  {
    num: "03",
    title: "List products the right way",
    desc: "Catalogue builder catches image, BIS, and golden-parameter gaps before GeM rejects you.",
    icon: Package,
  },
  {
    num: "04",
    title: "Price with freight & GST clarity",
    desc: "Freight Decoupler + GST Planner + cash-gap alerts so a win stays profitable and compliant.",
    icon: Truck,
  },
  {
    num: "05",
    title: "Fulfil & unlock CRAC",
    desc: "Orders track confirmed → in transit → delivered → CRAC → paid. Deadlocks get an escalation playbook.",
    icon: Shield,
  },
  {
    num: "06",
    title: "Enforce payment rights",
    desc: "MSMED interest, legal notice draft, and complaint path when government payments stall.",
    icon: Gavel,
  },
] as const;

const FEATURES = [
  {
    title: "Smart tender matching",
    desc: "Score every listing on fit — not a dump of every GeM bid.",
    icon: Search,
    href: "/opportunities",
  },
  {
    title: "Catalogue & product ease",
    desc: "Build GeM-ready listings; cut the ~33% first-submit rejection rate.",
    icon: Package,
    href: "/catalogue",
  },
  {
    title: "Freight Decoupler",
    desc: "Separate product and logistics so ₹2–5K freight mistakes don’t erase margin.",
    icon: Truck,
    href: "/freight-decoupler",
  },
  {
    title: "GST Planner & cashflow",
    desc: "Due dates, CGST+SGST, and cash-gap alerts before the 20th.",
    icon: Calculator,
    href: "/payments",
  },
  {
    title: "CRAC & payment tracking",
    desc: "See where money is stuck — delivery, CRAC, invoice, or PFMS.",
    icon: Banknote,
    href: "/payments",
  },
  {
    title: "File & escalate complaints",
    desc: "Deadlock playbook + MSMED legal notice when buyers don’t pay.",
    icon: Gavel,
    href: "/deadlock",
  },
  {
    title: "MSMED rights & interest",
    desc: "45-day rule, 3× RBI compound interest — calculated, not guessed.",
    icon: Scale,
    href: "/msme-rights",
  },
  {
    title: "Bid readiness & rating",
    desc: "Checklists, corrigenda alerts, reverse auction, rating recovery.",
    icon: Shield,
    href: "/rating",
  },
] as const;

const MARKET_STATS = [
  {
    value: "₹18.4L Cr",
    label: "GeM GMV scale",
    note: "India’s public procurement backbone",
  },
  {
    value: "60–70L+",
    label: "Registered sellers",
    note: "Only ~11L+ MSE sellers executing orders",
  },
  {
    value: "68%",
    label: "MSE order share",
    note: "MSEs already execute most GeM orders",
  },
  {
    value: "₹2–5L",
    label: "Avg. MSE order value",
    note: "Each win is a micro-enterprise cash event",
  },
] as const;

const ECONOMIC_IMPACT = [
  {
    title: "Unlock stuck sellers",
    body: "If Sahayak helps 1 lakh stuck sellers complete even 1 order → ₹200–500 Cr additional economic activity.",
  },
  {
    title: "Jobs per order",
    body: "Each order supports 1–3 jobs across manufacturing, logistics, and packaging.",
  },
  {
    title: "National scale",
    body: "Estimated 2–3 lakh new jobs if Sahayak-style enablement scales across GeM MSEs.",
  },
  {
    title: "Working-capital recovery",
    body: "CRAC + MSMED enforcement converts delayed receivables into statutory interest claims — capital stays in the formal MSE economy.",
  },
] as const;

function FeatureOpenButton({
  href,
  title,
  desc,
  icon: Icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: typeof Search;
}) {
  const router = useRouter();

  function handleOpen() {
    const result = ensureDemoSession("ramesh");
    if (result.success) {
      router.push(href);
    }
  }

  return (
    <button
      type="button"
      onClick={handleOpen}
      className="group flex flex-col rounded-2xl border bg-card p-5 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 text-sm font-bold group-hover:text-primary">{title}</h3>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        Open in app
        <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

export function HowItWorksPage() {
  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-background">
      <div className="landing-grid-bg pointer-events-none fixed inset-0" aria-hidden="true" />

      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
        <nav
          className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/20 bg-white/70 px-4 py-2.5 shadow-lg shadow-primary/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
          aria-label="How Sahayak works navigation"
        >
          <Link href="/welcome" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#1E3A5F] text-sm text-white">
              S
            </span>
            <span>Sahayak</span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#pain" className="hover:text-foreground">
              Pain points
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#impact" className="hover:text-foreground">
              Impact
            </a>
          </div>
          <Link
            href="/welcome"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-xl")}
          >
            Back to home
          </Link>
        </nav>
      </header>

      {/* Hero — what Sahayak is */}
      <section className="relative px-4 pb-16 pt-28 md:px-8 md:pt-36">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
            Judge brief · GeM Seller Co-Pilot
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            What Sahayak is — and why{" "}
            <span className="bg-gradient-to-r from-[#1E3A5F] via-blue-600 to-cyan-600 bg-clip-text text-transparent">
              India&apos;s MSE sellers need it
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Sahayak is a decision and cashflow co-pilot for Micro & Small Enterprise sellers on
            Government e-Marketplace (GeM). It does not replace GeM — it closes the gaps that keep
            registered sellers from completing orders, protecting margin, and getting paid.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <DemoUserDropdown />
            <a
              href="#pain"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-8")}
            >
              Read the brief
              <ArrowRight className="ml-2 size-4" />
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Audit figures cited from {SOURCE_BUSINESS_STANDARD}. Legal basis: {SOURCE_MSMED_RBI}.
            Not affiliated with GeM — prototype for demonstration.
          </p>
        </div>
      </section>

      {/* Market snapshot */}
      <section className="border-y border-primary/10 bg-primary/[0.03] px-4 py-10 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MARKET_STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl border bg-card/80 p-5 text-center shadow-sm">
              <p className="text-2xl font-extrabold tabular-nums text-primary md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-4 max-w-6xl text-center text-[11px] text-muted-foreground">
          {SOURCE_BUSINESS_STANDARD}
        </p>
      </section>

      {/* Pain points — ranked */}
      <section id="pain" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Problem brief
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Pain points — ranked by severity
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            From the blockers that freeze cash first, down to the friction that quietly kills win
            rates. Each row: the pain, the economic hit, and how Sahayak responds.
          </p>

          <div className="mt-12 space-y-4">
            {PAIN_POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <article
                  key={p.rank}
                  className={cn(
                    "overflow-hidden rounded-2xl border border-l-4 bg-card shadow-sm",
                    p.accent
                  )}
                >
                  <div className="grid gap-0 lg:grid-cols-12">
                    <div className="space-y-3 p-6 lg:col-span-5 lg:p-8">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground">{p.rank}</span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                            p.badge
                          )}
                        >
                          {p.severity}
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                          <Icon className="size-5 text-foreground" />
                        </div>
                        <h3 className="text-xl font-bold leading-snug">{p.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{p.problem}</p>
                    </div>
                    <div className="border-t bg-muted/30 p-6 lg:col-span-3 lg:border-l lg:border-t-0 lg:p-8">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Economic / business impact
                      </p>
                      <p className="mt-2 text-sm font-medium leading-relaxed">{p.impact}</p>
                    </div>
                    <div className="border-t bg-primary/[0.04] p-6 lg:col-span-4 lg:border-l lg:border-t-0 lg:p-8">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        How Sahayak helps
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-foreground">{p.sahayak}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t bg-muted/30 px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            From registration to payment — one co-pilot
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Same journey sellers already face on GeM — structured so nothing critical (CRAC, GST,
            freight, rights) falls through the cracks.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HOW_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20">
                      {step.num}
                    </span>
                    <Icon className="size-6 text-primary/40" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Product capabilities
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">What you can do inside Sahayak</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Freight, GST, catalogue ease, CRAC tracking, payment complaints, MSMED interest — and
            the tools that sit around winning the bid.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <FeatureOpenButton
                key={f.title}
                href={f.href}
                title={f.title}
                desc={f.desc}
                icon={f.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="border-t bg-muted/20 px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Economy & impact
          </p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">
            Why this matters beyond one seller
          </h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            GeM already concentrates MSE order share. The missing piece is converting registered
            sellers into executing suppliers — and keeping cash in the formal economy.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { value: 42, prefix: "₹", suffix: " Cr", label: "Tenders simulated in demo" },
              { value: 89, suffix: "%", label: "Readiness / win-rate lift (demo)" },
              { value: 12, suffix: " hrs", label: "Saved per seller / month" },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-2xl border bg-card px-5 py-6 text-center shadow-sm"
              >
                <p className="text-3xl font-extrabold tabular-nums text-primary">
                  <AnimatedCounter
                    value={c.value}
                    prefix={"prefix" in c ? c.prefix : ""}
                    suffix={c.suffix}
                  />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{c.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {ECONOMIC_IMPACT.map((item) => (
              <div
                key={item.title}
                className="flex gap-3 rounded-2xl border bg-card p-5 shadow-sm"
              >
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl gradient-hero p-8 text-white md:p-10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-6 text-amber-300" aria-hidden="true" />
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">
                Illustrative seller journey
              </p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  month: "Month 1",
                  text: "Registered, listed 4 products, won 0 bids",
                },
                {
                  month: "Month 2",
                  text: "Used Sahayak, fixed catalogue, won 2 bids worth ₹4.2L",
                },
                {
                  month: "Month 3",
                  text: "₹8.4L revenue, hired 2 employees",
                },
              ].map((step) => (
                <div
                  key={step.month}
                  className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    {step.month}
                  </p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-white/95">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-1 border-t border-white/15 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-lg font-bold text-emerald-300">Growth: 340% in 6 months</p>
              <p className="text-sm text-blue-200">
                Ramesh Furniture Works, Jaipur · prototype narrative
              </p>
            </div>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Market statistics: {SOURCE_BUSINESS_STANDARD}. Interest & payment rights:{" "}
            {SOURCE_MSMED_RBI}. Projected impact figures are estimates for evaluation — not audited
            company results.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 pt-4 md:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border bg-card px-8 py-14 text-center shadow-xl md:px-16">
          <IndianRupee className="mx-auto size-10 text-primary" aria-hidden="true" />
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">Experience the co-pilot</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Open a demo seller account — walk the same flows judges just read about: match,
            catalogue, freight, GST, CRAC, and MSMED rights.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <DemoUserDropdown />
            <Link
              href="/welcome"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-8")}
            >
              Marketing home
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        <p>Sahayak — GeM Seller Co-Pilot · Built for India&apos;s MSE ecosystem</p>
        <p className="mt-1 text-xs">
          Not affiliated with GeM. {SOURCE_BUSINESS_STANDARD}. {SOURCE_MSMED_RBI}.
        </p>
      </footer>
    </div>
  );
}

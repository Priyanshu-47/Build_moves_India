"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  Package,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { AnimatedCounter } from "@/components/ui/animated-counter";
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
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        <Sparkles className="size-4" />
        Try a demo account
        <svg className="ml-1 size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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

const STEPS = [
  { num: "01", title: "Find the right tenders", description: "Sahayak scores every GeM tender against your profile — product fit, location, capacity, and certifications.", icon: Search, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
  { num: "02", title: "Prepare winning bids", description: "Simulate costs, check readiness, and fix catalogue gaps before you submit — reducing rejections.", icon: Shield, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
  { num: "03", title: "Track your orders", description: "Monitor delivery, CRAC, invoices, and payments in one place. Never miss a deadline again.", icon: Package, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  { num: "04", title: "Get paid on time", description: "Know your MSMED Act rights. Calculate interest owed, generate legal notices, and escalate delays.", icon: IndianRupee, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40" },
  { num: "05", title: "Grow your business", description: "From stuck seller to active GeM supplier — Sahayak is your co-pilot every step of the way.", icon: TrendingUp, color: "text-primary bg-primary/10" },
] as const;

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <DemoUserDropdown />
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Title */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">How it works</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Four steps to your first order</h1>
          <p className="mt-3 text-base text-muted-foreground">Sahayak handles everything from finding tenders to getting paid.</p>
        </div>

        {/* Steps — vertical timeline */}
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent sm:left-8" aria-hidden="true" />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="relative flex gap-4 pb-8 last:pb-0 sm:gap-6">
                {/* Number badge */}
                <div className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 sm:size-14 sm:text-base">
                  {step.num}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-start gap-3">
                    <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${step.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{step.title}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                    </div>
                  </div>

                  {/* Feature preview card */}
                  {i === 0 && (
                    <div className="mt-4 ml-12 rounded-xl border bg-card p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Search className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">Smart matching</p>
                          <p className="text-xs text-muted-foreground">See 84/100 — not a wall of irrelevant tenders</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">84/100</span>
                      </div>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="mt-4 ml-12 rounded-xl border bg-card p-4 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                          <Package className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">Order tracking</p>
                          <div className="mt-1 flex gap-1.5">
                            {["Confirmed", "In Transit", "Delivered", "Paid"].map((s, j) => (
                              <span key={s} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${j < 3 ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{s}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {i === 3 && (
                    <div className="mt-4 ml-12 rounded-xl border bg-card p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                          <IndianRupee className="size-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold">MSMED interest calculator</p>
                          <p className="text-xs text-muted-foreground">₹47,000 interest owed on ₹5.8L overdue payment</p>
                        </div>
                        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600">₹47K owed</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <div className="inline-flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <p className="text-lg font-bold">Ready to try Sahayak?</p>
            <p className="max-w-sm text-sm text-muted-foreground">Pick a demo account below — no registration needed.</p>
            <DemoUserDropdown />
            <Link
              href="/"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition"
            >
              ← Back to landing page
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">₹18.4L Cr</p>
              <p className="text-xs text-muted-foreground">GeM GMV</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                <AnimatedCounter value={65} suffix="L" />
              </p>
              <p className="text-xs text-muted-foreground">Sellers</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">
                <AnimatedCounter value={68} suffix="%" />
              </p>
              <p className="text-xs text-muted-foreground">MSE orders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        <p>Sahayak — GeM Seller Co-Pilot · Built for India&apos;s MSE ecosystem</p>
      </footer>
    </div>
  );
}

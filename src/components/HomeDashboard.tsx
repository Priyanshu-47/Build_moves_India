"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CreditCard,
  MapPin,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import { NotificationBanners } from "@/components/NotificationBanners";
import { PageShell } from "@/components/PageShell";
import { PullToRefresh } from "@/components/PullToRefresh";
import { SellerJourney } from "@/components/SellerJourney";
import { CircularProgress } from "@/components/ui/circular-progress";
import { SellerProfile } from "@/lib/schemas";
import { getDashboardData, QUICK_LINKS } from "@/lib/rules/dashboard";
import { cn } from "@/lib/utils";

type HomeDashboardProps = {
  seller: SellerProfile;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatActivityDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

const TONE_DOT = {
  good: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  neutral: "bg-muted-foreground",
} as const;

const TONE_TEXT = {
  good: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

const STAT_ICONS = [TrendingUp, Briefcase, CreditCard, Star] as const;
const STAT_COLORS = [
  "text-blue-600 bg-blue-50",
  "text-emerald-600 bg-emerald-50",
  "text-amber-600 bg-amber-50",
  "text-violet-600 bg-violet-50",
] as const;

/* ── GovLedger-style horizontal progress bars for readiness targets ── */
const READINESS_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-rose-500"] as const;

export function HomeDashboard({ seller }: HomeDashboardProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const data = getDashboardData(seller);
  const firstName = seller.name.split(" ")[0];

  const handleRefresh = useCallback(async () => {
    setRefreshKey((k) => k + 1);
    await new Promise((resolve) => setTimeout(resolve, 600));
  }, []);

  /* Compute readiness percentages from status cards */
  const readinessScores = data.statusCards.map((card) => ({
    label: card.label,
    value: card.status === "good" ? 95 : card.status === "warning" ? 55 : 20,
    status: card.status,
  }));

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <PageShell wide key={refreshKey}>
        <NotificationBanners className="mb-3" />

        {/* ── GOVLEDGER TWO-COLUMN LAYOUT ── */}
        <div className="grid gap-5 lg:grid-cols-12">

          {/* ══════ LEFT COLUMN — Main content ══════ */}
          <div className="space-y-5 lg:col-span-8">

            {/* Hero greeting — compact */}
            <section className="relative overflow-hidden rounded-2xl gradient-hero p-5 text-white shadow-xl md:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(96,165,250,0.3)_0%,_transparent_60%)]" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-medium backdrop-blur">
                    <Sparkles className="size-3" aria-hidden="true" />
                    Command center
                  </span>
                  <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {getGreeting()}, {firstName}
                  </h1>
                  <p className="flex items-center gap-1.5 text-sm text-blue-100/80">
                    <MapPin className="size-3" aria-hidden="true" />
                    {seller.businessName} · {seller.city}
                  </p>
                </div>
                <div className="shrink-0 text-center">
                  <CircularProgress value={data.matchScore} max={100} size={76} strokeWidth={6} />
                  <p className="mt-1.5 text-[10px] font-semibold text-blue-100/70">
                    {data.matchCount} tenders match
                  </p>
                  <Link href="/opportunities" className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] font-semibold text-white hover:underline">
                    View all <ArrowRight className="size-2.5" />
                  </Link>
                </div>
              </div>
            </section>

            {/* ── STAT CARDS — Advaz compact grid style ── */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {data.stats.map((stat, i) => {
                const Icon = STAT_ICONS[i % STAT_ICONS.length];
                return (
                  <div key={stat.label} className="rounded-xl border bg-card p-3.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", STAT_COLORS[i % STAT_COLORS.length])}>
                        <Icon className="size-4" />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                    <p className="mt-2 text-xl font-extrabold tabular-nums">{stat.value}</p>
                    <div className="mt-1 flex items-center justify-between">
                      {stat.trendLabel && (
                        <p className={cn("text-[10px] font-semibold", stat.trend === "up" ? "text-emerald-600" : "text-destructive")}>
                          {stat.trend === "up" ? "↑" : "↓"} {stat.trendLabel}
                        </p>
                      )}
                      {stat.action && (
                        <Link href={stat.action.href} className="text-[10px] font-semibold text-primary hover:underline">
                          {stat.action.label} →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── READINESS PROGRESS BARS — GovLedger quarterly target style ── */}
            <section className="rounded-xl border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold">Your readiness targets</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {readinessScores.filter((r) => r.value >= 80).length}/{readinessScores.length} on track
                </span>
              </div>
              <div className="space-y-4">
                {readinessScores.map((target, i) => {
                  const barColor = READINESS_COLORS[i % READINESS_COLORS.length];
                  const isOnTrack = target.value >= 80;
                  return (
                    <div key={target.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("size-2 rounded-full", barColor)} />
                          <span className="font-medium">{target.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums">{target.value}%</span>
                          <span className={cn(
                            "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                            isOnTrack ? "bg-emerald-50 text-emerald-600" : target.value >= 50 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                          )}>
                            {isOnTrack ? "✓ On track" : target.value >= 50 ? "⚠ Below pace" : "✗ Threshold"}
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
                          style={{ width: `${target.value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ── PRIORITY ACTIONS — compact list ── */}
            {data.priorityActions.length > 0 && (
              <section className="rounded-xl border bg-card p-5">
                <div className="mb-3 flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-red-500 pulse-dot" />
                  <h2 className="text-sm font-bold">Priority actions</h2>
                </div>
                <div className="space-y-1.5">
                  {data.priorityActions.map((action, i) => {
                    const ActionIcon = action.icon;
                    return (
                      <Link
                        key={i}
                        href={action.action?.href ?? "#"}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50",
                          action.priority === "danger" && "bg-red-50/60",
                          action.priority === "warning" && "bg-amber-50/60"
                        )}
                      >
                        <ActionIcon className={cn(
                          "size-4 shrink-0",
                          action.priority === "danger" ? "text-red-600" : action.priority === "warning" ? "text-amber-600" : "text-primary"
                        )} />
                        <span className="flex-1 text-xs font-medium leading-snug">{action.label}</span>
                        {action.action && (
                          <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {action.action.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── QUICK LINKS — compact row ── */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-2 rounded-xl border bg-card p-3 transition-all hover:border-primary/20 hover:shadow-sm"
                >
                  <Icon className="size-4 text-primary" />
                  <span className="text-xs font-semibold">{label}</span>
                  <ArrowRight className="ml-auto size-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>

            {/* ── SELLER JOURNEY ── */}
            <SellerJourney seller={seller} />
          </div>

          {/* ══════ RIGHT COLUMN — GovLedger live feed sidebar ══════ */}
          <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">

            {/* Live activity feed */}
            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Live activity
                </h2>
                <span className="flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-500 pulse-dot" />
                  <span className="text-[9px] font-bold text-emerald-600">LIVE</span>
                </span>
              </div>
              <div className="space-y-0">
                {data.recentActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2.5 border-b border-dashed border-border/50 py-2.5 last:border-0"
                  >
                    <span className={cn("mt-1 size-1.5 shrink-0 rounded-full", TONE_DOT[item.tone])} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold leading-snug">{item.label}</p>
                      <p className={cn("text-[10px] leading-snug", TONE_TEXT[item.tone])}>{item.detail}</p>
                      <time className="mt-0.5 block text-[9px] text-muted-foreground">
                        {formatActivityDate(item.date)}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status overview — compact sidebar cards (GovLedger Compliance Risk style) */}
            <div className="rounded-xl border bg-card p-4">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Status overview
              </h2>
              <div className="space-y-2">
                {data.statusCards.map((card) => {
                  const Icon = card.icon;
                  const isGood = card.status === "good";
                  return (
                    <Link
                      key={card.label}
                      href={card.action?.href ?? "#"}
                      className="flex items-center gap-2.5 rounded-lg p-2 transition-colors hover:bg-muted/40"
                    >
                      <div className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md",
                        isGood ? "bg-emerald-50 text-emerald-600" : card.status === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                      )}>
                        <Icon className="size-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold">{card.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{card.value}</p>
                      </div>
                      <span className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                        isGood ? "bg-emerald-50 text-emerald-600" : card.status === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                      )}>
                        {isGood ? "✓" : card.status === "danger" ? "!" : "…"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </PageShell>
    </PullToRefresh>
  );
}

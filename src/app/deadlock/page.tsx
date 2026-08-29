"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  CirclePause,
  ClipboardList,
  Copy,
  ExternalLink,
  IndianRupee,
  Lock,
  MapPin,
  Package,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  calculateDeadlockInterest,
  detectDeadlock,
  getDeadlockEscalation,
  getTimelineSteps,
  loadDeadlockOrders,
} from "@/lib/rules/prc-crac-deadlock";
import { SOURCE_MSMED_RBI } from "@/lib/sources";
import { cn } from "@/lib/utils";

const orders = loadDeadlockOrders();

const ORDER_ICONS = [
  { bg: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300", Icon: ClipboardList },
  { bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300", Icon: Package },
  { bg: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300", Icon: IndianRupee },
] as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TimelineIcon({ status }: { status: "done" | "blocked" | "paused" | "pending" }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "blocked":
      return <Ban className="size-4 text-destructive" />;
    case "paused":
      return <CirclePause className="size-4 text-amber-500" />;
    default:
      return <Lock className="size-4 text-muted-foreground" />;
  }
}

function whoIsStuckLabel(party: string): string {
  switch (party) {
    case "consignee":
      return "Consignee (buyer department)";
    case "buyer_finance":
      return "Buyer accounts / finance";
    case "pfms":
      return "PFMS / treasury pipeline";
    default:
      return "Unknown — escalate to find out";
  }
}

export default function DeadlockPage() {
  const [selectedId, setSelectedId] = useState(orders[0]?.id ?? "");
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [showInterest, setShowInterest] = useState(false);

  const selected = useMemo(
    () => orders.find((order) => order.id === selectedId) ?? orders[0],
    [selectedId]
  );

  const analysis = useMemo(() => {
    if (!selected) return null;
    return {
      detection: detectDeadlock(selected),
      escalation: getDeadlockEscalation(selected),
      interest: calculateDeadlockInterest(selected),
      timeline: getTimelineSteps(selected),
    };
  }, [selected]);

  if (!selected || !analysis) return null;
  const { detection, escalation, interest, timeline } = analysis;

  async function copyTemplate(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <PageShell wide className="space-y-8">
      <Link
        href="/payments"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to payments
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          PRC → CRAC Deadlock
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
          Payment stuck? You might be in a process deadlock.
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          You delivered. But PRC, CRAC, or PFMS is blocking payment — and the next move is not
          yours.
        </p>
      </div>

      {/* What is a deadlock — hero strip */}
      <section className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                i
              </span>
              <p className="text-sm font-bold">What is a deadlock?</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                Seller delivers
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="rounded-full bg-red-50 px-3 py-1.5 text-red-700 dark:bg-red-950/40 dark:text-red-400">
                PRC pending
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                CRAC blocked
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="rounded-full bg-orange-50 px-3 py-1.5 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400">
                Payment frozen
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              You did everything right. But the next action belongs to someone else.
            </p>
          </div>
          <div
            className="relative hidden h-28 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-blue-100 lg:col-span-4 lg:flex dark:from-sky-950/30 dark:to-blue-950/40"
            aria-hidden="true"
          >
            <ClipboardList className="size-16 text-primary/40" />
            <IndianRupee className="absolute right-8 top-6 size-6 text-amber-500" />
            <MapPin className="absolute bottom-6 left-8 size-5 text-emerald-500" />
            <Lock className="absolute bottom-8 right-10 size-4 text-red-400" />
          </div>
        </div>
      </section>

      {/* Main two-column */}
      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Left: stuck orders + escalation */}
        <div className="space-y-6 lg:col-span-5">
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <p className="mb-4 text-sm font-bold">Your stuck orders</p>
            <div className="space-y-3">
              {orders.map((order, index) => {
                const preview = detectDeadlock(order);
                const isActive = order.id === selected.id;
                const visual = ORDER_ICONS[index % ORDER_ICONS.length];
                const Icon = visual.Icon;
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(order.id);
                      setShowInterest(false);
                      setExpandedLevel(null);
                    }}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left transition-all",
                      isActive
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "hover:border-primary/20 hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl",
                          visual.bg
                        )}
                      >
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-bold">{order.bidTitle}</p>
                          <Badge variant="destructive" className="shrink-0">
                            Stuck
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {order.department} · {formatCurrency(order.orderValue)}
                        </p>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          {preview.stuckAtLabel} · {preview.daysSinceDelivery} days since delivery
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-sm font-bold">Escalation playbook</p>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                Level {escalation.currentLevel} recommended
              </span>
            </div>
            <div className="space-y-2">
              {escalation.levels.map((step) => {
                const isCurrent = step.level === escalation.currentLevel;
                const isExpanded = expandedLevel === step.level;
                return (
                  <div
                    key={step.level}
                    className={cn(
                      "rounded-xl border p-3.5",
                      isCurrent && "border-amber-300 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold">
                          Level {step.level}: {step.action}
                          {isCurrent && (
                            <Badge className="ml-1.5" variant="default">
                              Current
                            </Badge>
                          )}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {step.portal} · Wait {step.daysToWait} days
                        </p>
                      </div>
                      {step.portalUrl && step.portalUrl !== "mailto:" && (
                        <a
                          href={step.portalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded-lg border bg-card px-2.5 py-1 text-[10px] font-semibold transition hover:bg-muted"
                        >
                          Open <ExternalLink className="ml-0.5 inline size-2.5" />
                        </a>
                      )}
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setExpandedLevel(isExpanded ? null : step.level)}
                        className="h-7 text-[10px]"
                      >
                        {isExpanded ? "Hide" : "View template"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyTemplate(step.template)}
                        className="h-7 text-[10px]"
                      >
                        <Copy className="mr-1 size-2.5" />
                        Copy
                      </Button>
                    </div>
                    {isExpanded && (
                      <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted p-2.5 text-[10px] whitespace-pre-wrap">
                        {step.template}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: selected order detail */}
        <div className="space-y-6 lg:col-span-7">
          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-4">
              <p className="text-lg font-bold">{selected.bidTitle}</p>
              <p className="text-xs text-muted-foreground">
                Order {selected.orderId} · Delivered {formatDate(selected.deliveryDate)}
              </p>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              {selected.stuckReason}
            </p>

            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border bg-muted/20 px-4 py-3">
              {timeline.map((step, index) => (
                <div key={step.key} className="flex items-center gap-2">
                  <TimelineIcon status={step.status} />
                  <span className="text-xs font-semibold">{step.label}</span>
                  {index < timeline.length - 1 && (
                    <span className="text-muted-foreground">→</span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Who&apos;s blocking
                </p>
                <p className="mt-1 text-sm font-bold">{whoIsStuckLabel(detection.whoIsStuck)}</p>
                <p className="text-xs text-muted-foreground">{selected.consigneeName}</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Days stuck
                </p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums text-destructive">
                  {detection.daysStuck}
                </p>
                <p className="text-xs text-muted-foreground">
                  Level {escalation.currentLevel} — next: {escalation.nextAction}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-2 text-sm font-bold">What you can do</p>
              <ul className="space-y-2">
                {detection.sellerActions.map((action) => (
                  <li
                    key={action}
                    className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
                  >
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm dark:border-amber-900 dark:bg-amber-950/30 sm:p-6">
            <div className="mb-2 flex items-center gap-2">
              <IndianRupee className="size-5 text-amber-600" />
              <p className="text-sm font-bold">You&apos;re owed interest — claim it</p>
            </div>
            <p className="text-sm">
              {formatCurrency(interest.principal)} × {interest.daysOverdue} days ≈{" "}
              <strong className="text-amber-800 dark:text-amber-300">
                {formatCurrency(interest.interestAccrued)}
              </strong>{" "}
              interest accrued
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              This is YOUR money. Claim it. · {interest.note}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 h-9 bg-card text-xs font-semibold"
              onClick={() => setShowInterest((v) => !v)}
            >
              {showInterest ? "Hide" : "Calculate interest"}
            </Button>
            {showInterest && (
              <div className="mt-3 rounded-xl border bg-card p-4 text-xs">
                <ul className="space-y-1.5">
                  <li>Principal: {formatCurrency(interest.principal)}</li>
                  <li>Days: {interest.daysOverdue}</li>
                  <li>Rate: {(interest.interestRate * 100).toFixed(2)}% p.a.</li>
                  <li>Interest: {formatCurrency(interest.interestAccrued)}</li>
                  <li className="font-bold">Total owed: {formatCurrency(interest.totalOwed)}</li>
                </ul>
              </div>
            )}
            <p className="mt-3 text-[10px] text-muted-foreground">{SOURCE_MSMED_RBI}</p>
          </section>
        </div>
      </div>

      {/* Footer actions — no Delivery POD checklist */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/payments"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-4 text-xs font-semibold transition hover:bg-muted/50"
        >
          Payment tracker
        </Link>
        <Link
          href="/msme-rights"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-4 text-xs font-semibold transition hover:bg-muted/50"
        >
          MSME rights
        </Link>
      </div>
    </PageShell>
  );
}

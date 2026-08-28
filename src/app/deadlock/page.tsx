"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  CheckCircle2,
  CirclePause,
  Copy,
  ExternalLink,
  IndianRupee,
  Lock,
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
import { PENALTY_RATE_ANNUAL } from "@/lib/rules/msme-rights";
import { SOURCE_MSMED_RBI } from "@/lib/sources";
import { cn } from "@/lib/utils";

const orders = loadDeadlockOrders();

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function TimelineIcon({ status }: { status: "done" | "blocked" | "paused" | "pending" }) {
  switch (status) {
    case "done": return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "blocked": return <Ban className="size-4 text-destructive" />;
    case "paused": return <CirclePause className="size-4 text-amber-500" />;
    default: return <Lock className="size-4 text-muted-foreground" />;
  }
}

function whoIsStuckLabel(party: string): string {
  switch (party) {
    case "consignee": return "Consignee (buyer department)";
    case "buyer_finance": return "Buyer accounts / finance";
    case "pfms": return "PFMS / treasury pipeline";
    default: return "Unknown — escalate to find out";
  }
}

export default function DeadlockPage() {
  const [selectedId, setSelectedId] = useState(orders[0]?.id ?? "");
  const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
  const [showInterest, setShowInterest] = useState(false);

  const selected = useMemo(() => orders.find((order) => order.id === selectedId) ?? orders[0], [selectedId]);

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
    <PageShell className="space-y-5">
      {/* Back link */}
      <Link href="/payments" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-3" />Back to payments
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">PRC → CRAC Deadlock</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Payment stuck? You might be in a process deadlock.</h1>
        <p className="mt-1 text-sm text-muted-foreground">You delivered. But PRC, CRAC, or PFMS is blocking payment — and the next move is not yours.</p>
      </div>

      {/* Process flow */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-2 text-xs font-bold">What is a deadlock?</p>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">Seller delivers</span>
          <span className="text-muted-foreground">→</span>
          <span className="rounded-lg bg-red-50 px-2 py-1 text-red-700">PRC pending</span>
          <span className="text-muted-foreground">→</span>
          <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-700">CRAC blocked</span>
          <span className="text-muted-foreground">→</span>
          <span className="rounded-lg bg-amber-50 px-2 py-1 text-amber-700">Payment frozen</span>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">You did everything right. But the next action belongs to someone else.</p>
      </div>

      {/* Order selector */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-3 text-xs font-bold">Your stuck orders</p>
        <div className="space-y-2">
          {orders.map((order) => {
            const preview = detectDeadlock(order);
            const isActive = order.id === selected.id;
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => { setSelectedId(order.id); setShowInterest(false); setExpandedLevel(null); }}
                className={cn("w-full rounded-lg border p-3 text-left transition-all", isActive ? "border-primary bg-primary/5" : "hover:bg-muted/30")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">{order.bidTitle}</p>
                    <p className="text-[10px] text-muted-foreground">{order.department} · {formatCurrency(order.orderValue)}</p>
                  </div>
                  <Badge variant="destructive">Stuck</Badge>
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">{preview.stuckAtLabel} · {preview.daysSinceDelivery} days since delivery</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected order detail */}
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3">
          <p className="text-xs font-bold">{selected.bidTitle}</p>
          <p className="text-[10px] text-muted-foreground">Order {selected.orderId} · Delivered {formatDate(selected.deliveryDate)}</p>
        </div>

        <p className="mb-3 text-xs text-muted-foreground">{selected.stuckReason}</p>

        {/* Timeline */}
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border p-3">
          {timeline.map((step, index) => (
            <div key={step.key} className="flex items-center gap-1.5">
              <TimelineIcon status={step.status} />
              <span className="text-[10px] font-medium">{step.label}</span>
              {index < timeline.length - 1 && <span className="text-muted-foreground">→</span>}
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border p-3">
            <p className="text-[10px] text-muted-foreground">Who&apos;s blocking</p>
            <p className="mt-0.5 text-xs font-semibold">{whoIsStuckLabel(detection.whoIsStuck)}</p>
            <p className="text-[10px] text-muted-foreground">{selected.consigneeName}</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-[10px] text-muted-foreground">Days stuck</p>
            <p className="mt-0.5 text-xs font-semibold">{detection.daysStuck} days</p>
            <p className="text-[10px] text-muted-foreground">Level {escalation.currentLevel} — next: {escalation.nextAction}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-bold">What you can do</p>
          <ul className="space-y-1">
            {detection.sellerActions.map((action) => (
              <li key={action} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-500" />{action}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Escalation playbook */}
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold">Escalation playbook</p>
          <span className="text-[10px] text-muted-foreground">Level {escalation.currentLevel} recommended</span>
        </div>
        <div className="space-y-2">
          {escalation.levels.map((step) => {
            const isCurrent = step.level === escalation.currentLevel;
            const isExpanded = expandedLevel === step.level;
            return (
              <div key={step.level} className={cn("rounded-lg border p-3", isCurrent && "border-primary bg-primary/5")}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold">Level {step.level}: {step.action}{isCurrent && <Badge className="ml-1.5" variant="default">Current</Badge>}</p>
                    <p className="text-[10px] text-muted-foreground">{step.portal} · Wait {step.daysToWait} days</p>
                  </div>
                  {step.portalUrl && step.portalUrl !== "mailto:" && (
                    <a href={step.portalUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg border px-2 py-1 text-[10px] font-semibold transition hover:bg-muted">
                      Open <ExternalLink className="ml-0.5 inline size-2.5" />
                    </a>
                  )}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => setExpandedLevel(isExpanded ? null : step.level)} className="h-7 text-[10px]">
                    {isExpanded ? "Hide" : "View template"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyTemplate(step.template)} className="h-7 text-[10px]">
                    <Copy className="mr-1 size-2.5" />Copy
                  </Button>
                </div>
                {isExpanded && (
                  <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted p-2.5 text-[10px] whitespace-pre-wrap">{step.template}</pre>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interest claim */}
      <div className="rounded-xl border border-amber-300 bg-amber-50/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <IndianRupee className="size-4 text-amber-600" />
          <p className="text-xs font-bold">You&apos;re owed interest — claim it</p>
        </div>
        <p className="text-sm">
          {formatCurrency(interest.principal)} × {interest.daysOverdue} days ≈ <strong className="text-amber-800">{formatCurrency(interest.interestAccrued)}</strong> interest accrued
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">This is YOUR money. Claim it. · {interest.note}</p>
        <Button variant="outline" size="sm" className="mt-2 h-7 text-[10px]" onClick={() => setShowInterest((v) => !v)}>
          {showInterest ? "Hide" : "Calculate interest"}
        </Button>
        {showInterest && (
          <div className="mt-2 rounded-lg border bg-card p-3 text-[10px]">
            <ul className="space-y-1">
              <li>Principal: {formatCurrency(interest.principal)}</li>
              <li>Days: {interest.daysOverdue}</li>
              <li>Rate: {(interest.interestRate * 100).toFixed(2)}% p.a.</li>
              <li>Interest: {formatCurrency(interest.interestAccrued)}</li>
              <li className="font-bold">Total owed: {formatCurrency(interest.totalOwed)}</li>
            </ul>
          </div>
        )}
        <p className="mt-2 text-[9px] text-muted-foreground">{SOURCE_MSMED_RBI}</p>
      </div>

      {/* Prevention tips */}
      <div className="rounded-xl border bg-card p-4">
        <p className="mb-2 text-xs font-bold">Prevent future deadlocks</p>
        <ul className="space-y-1 text-[10px] text-muted-foreground">
          <li>• Always get stamped POD with receiver name and date at delivery.</li>
          <li>• Follow up on PRC within 7 days of delivery — don&apos;t wait for CRAC.</li>
          <li>• Keep written records of all emails, calls, and visit logs.</li>
          <li>• Set a calendar reminder at day 10, 20, and 30 if PRC is missing.</li>
        </ul>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Link href="/payments" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition hover:bg-muted/50">Payment tracker</Link>
        <Link href="/msme-rights" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition hover:bg-muted/50">MSME rights</Link>
        <Link href="/delivery" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl gradient-cta px-3 text-xs font-semibold text-white">Delivery POD checklist</Link>
      </div>
    </PageShell>
  );
}

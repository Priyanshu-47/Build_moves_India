"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
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
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      return <CheckCircle2 className="size-5 text-green-600" aria-hidden="true" />;
    case "blocked":
      return <Ban className="size-5 text-destructive" aria-hidden="true" />;
    case "paused":
      return <CirclePause className="size-5 text-amber-600" aria-hidden="true" />;
    default:
      return <Lock className="size-5 text-muted-foreground" aria-hidden="true" />;
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
    const detection = detectDeadlock(selected);
    const escalation = getDeadlockEscalation(selected);
    const interest = calculateDeadlockInterest(selected);
    const timeline = getTimelineSteps(selected);
    return { detection, escalation, interest, timeline };
  }, [selected]);

  if (!selected || !analysis) return null;

  const { detection, escalation, interest, timeline } = analysis;

  async function copyTemplate(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <PageShell className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-medium text-primary">PRC → CRAC Deadlock</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Payment stuck? You might be in a process deadlock.
        </h1>
        <p className="text-sm text-muted-foreground">
          You delivered. But PRC, CRAC, or PFMS is blocking payment — and the next move is
          not yours.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What is a deadlock?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-4 font-medium">
            <span>Seller delivers</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-destructive">PRC pending</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-amber-600">CRAC blocked</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-amber-600">Payment frozen</span>
          </div>
          <p className="text-muted-foreground">
            You did everything right. But the next action belongs to someone else. This is
            the #1 reason sellers quit GeM.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your stuck orders</CardTitle>
          <CardDescription>
            {orders.length} order(s) blocked in the PRC → CRAC → payment chain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.map((order) => {
            const preview = detectDeadlock(order);
            const isActive = order.id === selected.id;

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
                  "w-full rounded-lg border p-4 text-left transition-colors",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/30 hover:bg-muted/30"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{order.bidTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.department} · {formatCurrency(order.orderValue)}
                    </p>
                  </div>
                  <Badge variant="destructive">Stuck</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{preview.stuckAtLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Days since delivery: {preview.daysSinceDelivery}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{selected.bidTitle}</CardTitle>
          <CardDescription>
            Order {selected.orderId} · Delivered {formatDate(selected.deliveryDate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{selected.stuckReason}</p>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
            {timeline.map((step, index) => (
              <div key={step.key} className="flex items-center gap-2">
                <TimelineIcon status={step.status} />
                <span className="text-sm font-medium">{step.label}</span>
                {index < timeline.length - 1 && (
                  <span className="mx-1 hidden text-muted-foreground sm:inline">→</span>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-3 text-sm">
              <p className="text-muted-foreground">Who&apos;s blocking</p>
              <p className="font-medium">{whoIsStuckLabel(detection.whoIsStuck)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{selected.consigneeName}</p>
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <p className="text-muted-foreground">Days stuck</p>
              <p className="font-medium">{detection.daysStuck} days</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Escalation level {escalation.currentLevel} — next: {escalation.nextAction}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">What you can do</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {detection.sellerActions.map((action) => (
                <li key={action} className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0 text-amber-600"
                    aria-hidden="true"
                  />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Escalation playbook</CardTitle>
          <CardDescription>
            Level {escalation.currentLevel} recommended — template letters ready to copy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {escalation.levels.map((step) => {
            const isCurrent = step.level === escalation.currentLevel;
            const isExpanded = expandedLevel === step.level;

            return (
              <div
                key={step.level}
                className={cn(
                  "rounded-lg border p-4",
                  isCurrent && "border-primary bg-primary/5"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      Level {step.level}: {step.action}
                      {isCurrent && (
                        <Badge className="ml-2" variant="default">
                          Current
                        </Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {step.portal} · Wait {step.daysToWait} days · {step.expectedResponse}
                    </p>
                  </div>
                  {step.portalUrl && step.portalUrl !== "mailto:" && (
                    <a
                      href={step.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Open portal
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpandedLevel(isExpanded ? null : step.level)}
                  >
                    {isExpanded ? "Hide template" : "View template"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyTemplate(step.template)}
                  >
                    <Copy className="size-3.5" aria-hidden="true" />
                    Copy template
                  </Button>
                </div>

                {isExpanded && (
                  <pre className="mt-3 max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
                    {step.template}
                  </pre>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="border-amber-300 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IndianRupee className="size-5 text-amber-700" aria-hidden="true" />
            <CardTitle className="text-base">You&apos;re owed interest — claim it</CardTitle>
          </div>
          <CardDescription>
            Under MSMED Act Section 16, buyer owes {(PENALTY_RATE_ANNUAL * 100).toFixed(2)}%
            p.a. compound interest on delayed payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg">
            {formatCurrency(interest.principal)} × {interest.daysOverdue} days ≈{" "}
            <strong className="text-amber-800 dark:text-amber-300">
              {formatCurrency(interest.interestAccrued)}
            </strong>{" "}
            interest accrued
          </p>
          <p className="text-sm text-muted-foreground">This is YOUR money. Claim it.</p>
          <p className="text-xs text-muted-foreground">{SOURCE_MSMED_RBI}</p>
          <p className="text-xs text-muted-foreground">{interest.note}</p>

          <Button variant="outline" onClick={() => setShowInterest((value) => !value)}>
            {showInterest ? "Hide breakdown" : "Calculate interest"}
          </Button>

          {showInterest && (
            <div className="rounded-lg border bg-background p-4 text-sm">
              <ul className="space-y-1">
                <li>Principal: {formatCurrency(interest.principal)}</li>
                <li>Days counted: {interest.daysOverdue}</li>
                <li>
                  Rate: {(interest.interestRate * 100).toFixed(2)}% p.a. (3× RBI notified
                  rate, compounded monthly)
                </li>
                <li>Interest accrued: {formatCurrency(interest.interestAccrued)}</li>
                <li className="font-bold">Total owed: {formatCurrency(interest.totalOwed)}</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prevent future deadlocks</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Always get stamped POD with receiver name and date at delivery.</li>
            <li>Follow up on PRC within 7 days of delivery — don&apos;t wait for CRAC.</li>
            <li>Keep written records of all emails, calls, and visit logs.</li>
            <li>Set a calendar reminder at day 10, 20, and 30 if PRC is missing.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/payments" className={buttonVariants({ variant: "outline" })}>
          Payment tracker
        </Link>
        <Link href="/msme-rights" className={buttonVariants({ variant: "outline" })}>
          MSME rights guide
        </Link>
        <Link href="/delivery" className={buttonVariants()}>
          Delivery POD checklist
        </Link>
      </div>
    </PageShell>
  );
}

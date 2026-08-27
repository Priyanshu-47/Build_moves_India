"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Gavel,
  IndianRupee,
  Scale,
} from "lucide-react";

import { getAccountPayments } from "@/lib/demo-data";
import { GSTPlanner } from "@/components/GSTPlanner";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PaymentAlert } from "@/components/PaymentAlert";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentOrder } from "@/lib/schemas";
import {
  MSMED_PAYMENT_PERIOD_DAYS,
  PENALTY_RATE_ANNUAL,
  checkPaymentRights,
  daysBetween,
  getEscalationSteps,
} from "@/lib/rules/msme-rights";
import { checkCashGap } from "@/lib/rules/gst-planner";
import { SOURCE_MSMED_RBI } from "@/lib/sources";
import { cn } from "@/lib/utils";

function useAccountPayments(): PaymentOrder[] {
  return useMemo(() => getAccountPayments(), []);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: PaymentOrder["status"]): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "stuck":
      return "Stuck — No CRAC";
    case "overdue":
      return "Payment Overdue";
    default:
      return "Pending";
  }
}

function statusVariant(
  status: PaymentOrder["status"]
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
      return "default";
    case "overdue":
      return "destructive";
    case "stuck":
      return "secondary";
    default:
      return "outline";
  }
}

type TimelineStep = {
  key: string;
  label: string;
  date: string | null;
  done: boolean;
  active: boolean;
};

function getPaymentTimeline(order: PaymentOrder): TimelineStep[] {
  const paid = order.status === "paid";
  const cracDone = order.cracGenerated;
  const invoiceDone = order.invoiceDate !== null;
  const paymentDone = paid;

  return [
    {
      key: "order",
      label: "Order",
      date: order.orderDate,
      done: true,
      active: false,
    },
    {
      key: "delivery",
      label: "Delivery",
      date: order.deliveryDate,
      done: true,
      active: !cracDone && order.status !== "paid",
    },
    {
      key: "crac",
      label: "CRAC",
      date: order.cracDate,
      done: cracDone,
      active: cracDone && !invoiceDone && !paid,
    },
    {
      key: "invoice",
      label: "Invoice",
      date: order.invoiceDate,
      done: invoiceDone,
      active: invoiceDone && !paid,
    },
    {
      key: "payment",
      label: "Payment",
      date: order.paymentDate,
      done: paymentDone,
      active: paymentDone,
    },
  ];
}

function TimelineIcon({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return <CheckCircle2 className="size-4 shrink-0 text-green-600" aria-hidden="true" />;
  }
  if (active) {
    return <Clock className="size-4 shrink-0 text-amber-600" aria-hidden="true" />;
  }
  return <Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />;
}

function PaymentTimeline({ order }: { order: PaymentOrder }) {
  const steps = getPaymentTimeline(order);
  const totalDays =
    order.status === "paid" && order.paymentDate
      ? daysBetween(order.orderDate, order.paymentDate)
      : daysBetween(order.deliveryDate);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Payment timeline</span>
        <span>
          {order.status === "paid"
            ? `${totalDays} days order → payment`
            : `${totalDays} days since delivery`}
        </span>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className="flex flex-1 items-start gap-2 sm:flex-col sm:items-center sm:text-center"
          >
            <div className="flex items-center gap-2 sm:flex-col">
              <TimelineIcon done={step.done} active={step.active} />
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "hidden h-0.5 flex-1 sm:block sm:h-px sm:w-full",
                    step.done ? "bg-green-600" : "bg-muted"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-xs font-medium",
                  step.done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              {step.date && (
                <p className="text-[10px] text-muted-foreground sm:text-xs">
                  {formatDate(step.date)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentOrderCard({ order }: { order: PaymentOrder }) {
  const [showClaim, setShowClaim] = useState(false);
  const rights = checkPaymentRights(order);
  const escalation = getEscalationSteps(order);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base leading-snug break-words">
              {order.bidTitle}
            </CardTitle>
            <CardDescription>{order.department}</CardDescription>
          </div>
          <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Order value:</span>{" "}
            <strong>{formatCurrency(order.totalValue)}</strong>
          </p>
          <p>
            <span className="text-muted-foreground">Ordered:</span>{" "}
            {formatDate(order.orderDate)}
          </p>
        </div>

        <PaymentTimeline order={order} />

        {order.status === "overdue" && <PaymentAlert order={order} />}

        {order.status === "stuck" && (
          <Alert>
            <AlertTriangle className="size-4" aria-hidden="true" />
            <AlertTitle>
              Stuck {rights.daysSinceDelivery} days — CRAC not generated
            </AlertTitle>
            <AlertDescription>
              Goods delivered but consignee has not generated CRAC. Payment cannot proceed
              until acceptance is recorded on GeM.
            </AlertDescription>
          </Alert>
        )}

        {rights.eligible && order.status === "stuck" && (
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setShowClaim((value) => !value)}
            >
              <Gavel className="size-4" aria-hidden="true" />
              File Claim
            </Button>

            {showClaim && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="mb-2 text-sm font-medium">Escalation steps</p>
                <ol className="space-y-2">
                  {escalation.map((step, index) => (
                    <li key={step} className="flex gap-2 text-sm">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PaymentsPage() {
  const orders = useAccountPayments();

  const summary = useMemo(() => {
    let received = 0;
    let pending = 0;
    let stuck = 0;

    for (const order of orders) {
      if (order.status === "paid") {
        received += order.totalValue;
      } else if (order.status === "stuck" || order.status === "overdue") {
        stuck += order.totalValue;
      } else {
        pending += order.totalValue;
      }
    }

    return { received, pending, stuck };
  }, [orders]);

  const gstSummary = useMemo(() => checkCashGap(orders, 119_160), [orders]);

  return (
    <PageShell>
      <PageHeader
        title="Payments"
        backUrl="/"
        subtitle="Track CRAC, invoices, and delayed payments — know your MSMED Act rights."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total received</CardDescription>
            <CardTitle className="text-2xl text-green-700 dark:text-green-400">
              {formatCurrency(summary.received)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total pending</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(summary.pending)}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total stuck / overdue</CardDescription>
            <CardTitle className="text-2xl text-destructive">
              {formatCurrency(summary.stuck)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>GST liability (unpaid)</CardDescription>
            <CardTitle className="text-2xl text-amber-700 dark:text-amber-400">
              {formatCurrency(gstSummary.totalGSTDue)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {gstSummary.gap > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="size-4" aria-hidden="true" />
          <AlertTitle>Cash gap alert</AlertTitle>
          <AlertDescription>
            You need {formatCurrency(gstSummary.gap)} for GST before{" "}
            {formatCurrency(210_000)} payment arrives. GST must be paid by the 20th of next
            month regardless of payment status.
          </AlertDescription>
        </Alert>
      )}

      <div className="print-content print-expand mb-6 space-y-4">
        {orders.length === 0 ? (
          <EmptyState
            icon={IndianRupee}
            title="No payments yet"
            description="No payments yet. Win your first bid to start tracking."
            actions={[
              { label: "Browse opportunities", action: "/opportunities" },
              { label: "Simulate a bid", action: "/simulate", variant: "outline" },
            ]}
          />
        ) : (
          orders.map((order) => <PaymentOrderCard key={order.id} order={order} />)
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>GST payment planner</CardTitle>
          <CardDescription>
            GST liability, due dates, and cash gap vs government payment timing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GSTPlanner />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Scale className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Your rights under MSMED Act</CardTitle>
          </div>
          <CardDescription>Section 15 & 16 — delayed payment protection for MSEs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <IndianRupee className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p>
              Buyers must pay within <strong>{MSMED_PAYMENT_PERIOD_DAYS} days</strong> of
              accepting goods or services. After that, compound interest at{" "}
              <strong>3× the RBI notified rate</strong> (~
              {(PENALTY_RATE_ANNUAL * 100).toFixed(2)}% p.a., compounded monthly) is
              legally due.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Gavel className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p>
              If payment is delayed, escalate: consignee follow-up → GeM incident →
              CPGRAMS grievance → MSME Samadhaan / ODR portal for dispute resolution.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
            <p>
              CRAC (Consignee Receipt & Acceptance Certificate) is critical — without it,
              the payment clock never starts and you cannot claim MSMED interest.
            </p>
          </div>
          <Link
            href="/msme-rights"
            className="inline-flex h-9 items-center rounded-lg border px-4 text-sm font-medium hover:bg-muted"
          >
            Read full MSME rights guide →
          </Link>
          <p className="text-xs text-muted-foreground">{SOURCE_MSMED_RBI}</p>
        </CardContent>
      </Card>
    </PageShell>
  );
}

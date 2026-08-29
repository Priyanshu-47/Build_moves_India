"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Circle,
  DollarSign,
  Package,
  Scale,
  TrendingUp,
  Truck,
} from "lucide-react";

import { getAccountPayments } from "@/lib/demo-data";
import { FreightCalculator } from "@/components/FreightCalculator";
import { FloorPriceCalculator } from "@/components/FloorPriceCalculator";
import { ScalingCalculator } from "@/components/ScalingCalculator";
import { PageShell } from "@/components/PageShell";
import { PaymentOrder } from "@/lib/schemas";
import {
  MSMED_PAYMENT_PERIOD_DAYS,
  PENALTY_RATE_ANNUAL,
  checkPaymentRights,
} from "@/lib/rules/msme-rights";
import {
  calculateGSTLiability,
  checkCashGap,
  formatGSTDate,
  getPaymentTimeline,
} from "@/lib/rules/gst-planner";
import { SOURCE_MSMED_RBI } from "@/lib/sources";
import { cn } from "@/lib/utils";

type ToolTab = "gst" | "freight" | "floor" | "scaling";

const CASH_FLOW_DATA = [
  { month: "Mar", inflow: 210000, outflow: 85000 },
  { month: "Apr", inflow: 350000, outflow: 120000 },
  { month: "May", inflow: 180000, outflow: 95000 },
  { month: "Jun", inflow: 580000, outflow: 150000 },
  { month: "Jul", inflow: 420000, outflow: 180000 },
  { month: "Aug", inflow: 912000, outflow: 210000 },
] as const;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLakhs(value: number): string {
  const lakhs = value / 100000;
  return `₹${lakhs.toFixed(2).replace(/\.?0+$/, "")}L`;
}

function gstCardStatus(order: PaymentOrder): "healthy" | "pending" | "overdue" {
  if (order.status === "paid") return "healthy";
  if (order.status === "overdue") return "overdue";
  return "pending";
}

function TimelineOrderCard({ order }: { order: PaymentOrder }) {
  const liability = calculateGSTLiability(order);
  const timeline = getPaymentTimeline(order);
  const cardStatus = gstCardStatus(order);
  const rights = checkPaymentRights(order);

  const statusStyles = {
    healthy: {
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      label: "Received",
      line: "bg-emerald-500",
      accent: "border-l-emerald-500",
      icon: "bg-emerald-50 text-emerald-600",
    },
    pending: {
      badge: "bg-amber-50 text-amber-700 ring-amber-200",
      label: "Pending",
      line: "bg-amber-400",
      accent: "border-l-amber-400",
      icon: "bg-amber-50 text-amber-600",
    },
    overdue: {
      badge: "bg-rose-50 text-rose-700 ring-rose-200",
      label: "Overdue",
      line: "bg-rose-500",
      accent: "border-l-rose-500",
      icon: "bg-rose-50 text-rose-600",
    },
  }[cardStatus];

  const progressPct =
    cardStatus === "healthy" ? 100 : cardStatus === "pending" ? 55 : 80;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm border-l-[3px]",
        statusStyles.accent
      )}
    >
      <div className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-xl",
                statusStyles.icon
              )}
            >
              <Package className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold leading-snug text-foreground">{order.bidTitle}</p>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1",
                    statusStyles.badge
                  )}
                >
                  {statusStyles.label}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{order.id}</p>
            </div>
          </div>

          <div className="sm:text-right">
            <p className="text-lg font-extrabold tabular-nums text-foreground">
              {formatCurrency(order.totalValue)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              GST {formatCurrency(liability.total)}
            </p>
          </div>
        </div>

        {/* Timeline: Delivery → GST Due */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Delivery Date</span>
            <span>GST Due</span>
          </div>
          <div className="relative flex items-center gap-3">
            <div className="flex flex-col items-start">
              {cardStatus === "healthy" || cardStatus === "overdue" ? (
                <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
              ) : (
                <Circle className="size-4 text-amber-500" aria-hidden="true" />
              )}
              <p className="mt-1 text-xs font-medium text-foreground">
                {formatGSTDate(timeline.deliveryDate)}
              </p>
            </div>

            <div className="relative mx-1 h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all", statusStyles.line)}
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="flex flex-col items-end">
              {cardStatus === "healthy" ? (
                <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
              ) : cardStatus === "overdue" ? (
                <AlertTriangle className="size-4 text-rose-500" aria-hidden="true" />
              ) : (
                <Circle className="size-4 text-muted-foreground/50" aria-hidden="true" />
              )}
              <p
                className={cn(
                  "mt-1 text-xs font-semibold",
                  cardStatus === "overdue" ? "text-rose-600" : "text-foreground"
                )}
              >
                {formatGSTDate(liability.dueDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-1 border-t px-5 py-3 text-xs sm:flex-row sm:items-center sm:justify-between",
          cardStatus === "overdue"
            ? "bg-rose-50/80 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
            : cardStatus === "pending"
              ? "bg-amber-50/70 text-amber-800 dark:bg-amber-950/20 dark:text-amber-200"
              : "bg-emerald-50/70 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300"
        )}
      >
        <p className="font-medium">
          {cardStatus === "healthy"
            ? "Payment received before GST due — healthy cash flow."
            : cardStatus === "overdue"
              ? "GST due date aligns with expected payment window. Overdue!"
              : "GST not yet due — invoice generation in progress."}
        </p>
        {cardStatus === "overdue" && rights.interestAmount > 0 && (
          <p className="font-semibold tabular-nums">
            Interest accruing: {formatCurrency(rights.interestAmount)}
          </p>
        )}
        {cardStatus === "pending" && (
          <p className="text-muted-foreground">Status: Pending government transfer</p>
        )}
      </div>
    </article>
  );
}

export default function PaymentsPage() {
  const orders = useMemo(() => getAccountPayments(), []);
  const [toolTab, setToolTab] = useState<ToolTab>("gst");

  const summary = useMemo(() => {
    let received = 0;
    let pending = 0;
    let stuck = 0;
    let totalInterest = 0;
    for (const order of orders) {
      if (order.status === "paid") received += order.totalValue;
      else if (order.status === "stuck" || order.status === "overdue") {
        stuck += order.totalValue;
        totalInterest += checkPaymentRights(order).interestAmount;
      } else pending += order.totalValue;
    }
    const totalRevenue = received + pending + stuck;
    return { received, pending, stuck, totalInterest, totalRevenue };
  }, [orders]);

  const gstSummary = useMemo(() => checkCashGap(orders, 119_160), [orders]);

  const totalInflow = CASH_FLOW_DATA.reduce((s, d) => s + d.inflow, 0);
  const totalOutflow = CASH_FLOW_DATA.reduce((s, d) => s + d.outflow, 0);
  const netCash = totalInflow - totalOutflow;
  const pendingTotal = summary.pending + summary.stuck;

  const toolTabs: { key: ToolTab; label: string; icon: typeof Calculator }[] = [
    { key: "gst", label: "GST Planner", icon: Calculator },
    { key: "freight", label: "Freight Calculator", icon: Truck },
    { key: "floor", label: "Floor Price", icon: DollarSign },
    { key: "scaling", label: "Scaling Plan", icon: TrendingUp },
  ];

  const kpiCards = [
    {
      label: "Total GST Due (This Month)",
      value: formatCurrency(gstSummary.totalGSTDue),
      meta: "+₹1,04,400 upcoming",
      metaClass: "text-amber-600",
      desc: "Consolidated CGST + SGST liabilities",
      accent: "border-l-amber-400",
      valueClass: "text-foreground",
    },
    {
      label: "Total Taxable Value",
      value: formatCurrency(summary.totalRevenue),
      meta: `Across ${orders.length} active contracts`,
      metaClass: "text-emerald-600",
      desc: "Total invoice value of current orders",
      accent: "border-l-emerald-400",
      valueClass: "text-emerald-600",
    },
    {
      label: "Payments Received",
      value: formatCurrency(summary.received),
      meta: summary.received > 0 ? "100% Secure" : "Awaiting first transfer",
      metaClass: "text-muted-foreground",
      desc: "Transferred directly to bank account",
      accent: "border-l-sky-400",
      valueClass: "text-foreground",
    },
    {
      label: "Payments Pending",
      value: formatCurrency(pendingTotal),
      meta: `${orders.filter((o) => o.status !== "paid").length} Orders Pending`,
      metaClass: "text-amber-600",
      desc: "GST due timeline aligned",
      accent: "border-l-violet-400",
      valueClass: "text-amber-600",
    },
  ];

  return (
    <PageShell className="pb-10">
      {/* Header */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Payments &amp; Cashflow
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Track CRAC, invoices, and delayed payments. Monitor your MSMED Act rights
            dynamically.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {summary.totalInterest > 0 && (
            <span className="inline-flex h-8 items-center rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 shadow-sm dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
              Owed {formatCurrency(summary.totalInterest)} interest
            </span>
          )}
          <span className="inline-flex h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 shadow-sm dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
            {formatCurrency(pendingTotal)} pending
          </span>
          <span className="inline-flex h-8 items-center rounded-full border bg-card px-3 text-xs font-semibold text-muted-foreground shadow-sm">
            {formatCurrency(0)} GST interest owed
          </span>
        </div>
      </header>

      {/* Chart + KPI stack */}
      <div className="mt-7 grid items-start gap-5 lg:grid-cols-12">
        <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-foreground">Cash Flow Dynamics</p>
              <p className="text-xs text-muted-foreground">Inflow vs outflow — last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
                Inflow
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-400" aria-hidden="true" />
                Outflow
              </span>
            </div>
          </div>

          <svg viewBox="0 0 580 210" className="w-full" aria-label="Cash flow chart">
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="50"
                y1={10 + i * 40}
                x2="570"
                y2={10 + i * 40}
                stroke="currentColor"
                className="text-muted/30"
                strokeWidth="0.5"
                strokeDasharray="3 3"
              />
            ))}
            {["₹8L", "₹6L", "₹4L", "₹2L", "₹0"].map((label, i) => (
              <text
                key={label}
                x="46"
                y={14 + i * 40}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize="9"
                fontWeight="500"
              >
                {label}
              </text>
            ))}
            {CASH_FLOW_DATA.map((d, i) => {
              const centerX = 93 + i * 87;
              const barW = 22;
              const gap = 3;
              const barLeft = centerX - (barW * 2 + gap) / 2;
              const maxVal = 1000000;
              const chartH = 160;
              const baseY = 170;
              const inH = (d.inflow / maxVal) * chartH;
              const outH = (d.outflow / maxVal) * chartH;
              return (
                <g key={d.month}>
                  <rect
                    x={barLeft}
                    y={baseY - inH}
                    width={barW}
                    height={inH}
                    rx="4"
                    className="fill-emerald-500"
                    opacity="0.92"
                  />
                  <rect
                    x={barLeft + barW + gap}
                    y={baseY - outH}
                    width={barW}
                    height={outH}
                    rx="4"
                    className="fill-amber-400"
                    opacity="0.92"
                  />
                  <text
                    x={centerX}
                    y="192"
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    fontSize="11"
                    fontWeight="500"
                  >
                    {d.month}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-4 grid grid-cols-3 gap-3 border-t pt-4">
            <div>
              <p className="text-[11px] text-muted-foreground">Total Inflow</p>
              <p className="text-sm font-bold tabular-nums text-emerald-600">
                {formatLakhs(totalInflow)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Total Outflow</p>
              <p className="text-sm font-bold tabular-nums text-amber-600">
                {formatLakhs(totalOutflow)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Net Cash</p>
              <p className="text-sm font-bold tabular-nums text-foreground">
                {formatLakhs(netCash)}
              </p>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-3 lg:col-span-5">
          {kpiCards.map((card) => (
            <div
              key={card.label}
              className={cn(
                "rounded-2xl border border-l-[3px] bg-card px-5 py-4 shadow-sm",
                card.accent
              )}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {card.label}
              </p>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
                <p className={cn("text-xl font-extrabold tabular-nums", card.valueClass)}>
                  {card.value}
                </p>
                <span className={cn("text-[11px] font-semibold", card.metaClass)}>
                  {card.meta}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{card.desc}</p>
            </div>
          ))}
        </aside>
      </div>

      {/* Alerts row */}
      <div className="mt-5 grid gap-4 lg:grid-cols-12">
        {gstSummary.gap > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between lg:col-span-7 dark:border-rose-900 dark:bg-rose-950/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-rose-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                  Critical Cash Gap Alert
                </p>
                <p className="mt-1 text-xs leading-relaxed text-rose-600/90 dark:text-rose-300/90">
                  You need {formatCurrency(gstSummary.gap)} for GST before payments arrive —
                  {formatCurrency(gstSummary.totalGSTDue)} due by the 20th of next month.
                </p>
              </div>
            </div>
            <Link
              href="/msme-rights"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-rose-300 bg-white px-4 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900"
            >
              Learn more
            </Link>
          </div>
        )}

        {summary.totalInterest > 0 && (
          <div
            className={cn(
              "flex flex-col gap-3 rounded-2xl bg-primary p-4 text-primary-foreground sm:flex-row sm:items-center sm:justify-between",
              gstSummary.gap > 0 ? "lg:col-span-5" : "lg:col-span-12"
            )}
          >
            <div>
              <p className="text-sm font-bold">
                Owed {formatCurrency(summary.totalInterest)} interest
              </p>
              <p className="mt-1 text-xs text-primary-foreground/80">
                MSMED Act Section 16 — compound interest at 3× RBI rate
              </p>
            </div>
            <Link
              href="/msme-rights#legal-notice"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-white/40 bg-transparent px-4 text-xs font-semibold text-primary-foreground transition hover:bg-white/10"
            >
              Generate Legal Notice
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions — only unique destinations */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        <Link
          href="/msme-rights"
          className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/25 hover:bg-muted/40"
        >
          <Scale className="size-4 text-primary" aria-hidden="true" />
          MSME Rights &amp; Legal Notice
        </Link>
        <Link
          href="/orders"
          className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/25 hover:bg-muted/40"
        >
          <Package className="size-4 text-primary" aria-hidden="true" />
          View All Orders
        </Link>
      </div>

      {/* Tools + GST scheduler */}
      <section className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto border-b bg-muted/25 px-4 py-3 sm:px-5">
          {toolTabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setToolTab(key)}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-xs font-semibold transition",
                toolTab === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-6">
          {toolTab === "gst" && (
            <div className="space-y-5">
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  <strong>GST must be paid by the 20th of the next month</strong> regardless of
                  whether the government buyer has paid you yet. Ensure your cash flow is managed
                  accordingly.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground">
                  GST Payment Scheduler &amp; Orders
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Track GST liabilities against payment timelines
                </p>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <TimelineOrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}

          {toolTab === "freight" && (
            <div>
              <p className="mb-3 text-sm font-semibold">Freight Decoupler Calculator</p>
              <FreightCalculator />
            </div>
          )}
          {toolTab === "floor" && (
            <div>
              <p className="mb-3 text-sm font-semibold">Reverse Auction Floor Price</p>
              <FloorPriceCalculator />
            </div>
          )}
          {toolTab === "scaling" && (
            <div>
              <p className="mb-3 text-sm font-semibold">Revenue Scaling Plan</p>
              <ScalingCalculator />
            </div>
          )}
        </div>
      </section>

      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        MSMED Act: pay within <strong className="text-foreground">{MSMED_PAYMENT_PERIOD_DAYS} days</strong>{" "}
        of accepting goods. After that, compound interest at{" "}
        <strong className="text-foreground">3× RBI rate</strong> (~
        {(PENALTY_RATE_ANNUAL * 100).toFixed(2)}% p.a.). {SOURCE_MSMED_RBI}.
      </p>
    </PageShell>
  );
}

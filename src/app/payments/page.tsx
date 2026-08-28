"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  DollarSign,
  Download,
  Gavel,
  Package,
  Scale,
  SlidersHorizontal,
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
  return `₹${(value / 100000).toFixed(2).replace(/\.?0+$/, "")}L`;
}

function gstCardStatus(order: PaymentOrder): "healthy" | "pending" | "overdue" {
  if (order.status === "paid") return "healthy";
  if (order.status === "overdue") return "overdue";
  return "pending";
}

function GSTOrderCard({ order }: { order: PaymentOrder }) {
  const liability = calculateGSTLiability(order);
  const timeline = getPaymentTimeline(order);
  const cardStatus = gstCardStatus(order);

  const statusConfig = {
    healthy: {
      iconBg: "bg-emerald-100 text-emerald-600",
      badge: "status-badge status-badge--success",
      badgeLabel: "Received",
      footerBg: "bg-emerald-50 dark:bg-emerald-950/30",
      footerText: "text-emerald-700 dark:text-emerald-400",
      footerMsg: "Payment received before GST due — healthy cash flow.",
      progress: "bg-emerald-500",
      progressPct: 100,
      border: "",
    },
    pending: {
      iconBg: "bg-amber-100 text-amber-600",
      badge: "status-badge status-badge--warning",
      badgeLabel: "Pending",
      footerBg: "bg-amber-50 dark:bg-amber-950/30",
      footerText: "text-amber-700 dark:text-amber-400",
      footerMsg: "GST not yet due — invoice generation in progress.",
      progress: "bg-amber-400",
      progressPct: 45,
      border: "",
    },
    overdue: {
      iconBg: "bg-red-100 text-red-600",
      badge: "status-badge status-badge--danger",
      badgeLabel: "Overdue",
      footerBg: "bg-red-50 dark:bg-red-950/30",
      footerText: "text-red-700 dark:text-red-400",
      footerMsg: "GST due date aligns with expected payment window. Overdue!",
      progress: "bg-red-500",
      progressPct: 80,
      border: "border-red-300 dark:border-red-800",
    },
  }[cardStatus];

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card shadow-sm", statusConfig.border)}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                statusConfig.iconBg
              )}
            >
              <Package className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold leading-snug">{order.bidTitle}</p>
              <p className="text-xs text-muted-foreground">{order.id}</p>
            </div>
          </div>
          <span className={statusConfig.badge}>{statusConfig.badgeLabel}</span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Taxable value
            </p>
            <p className="mt-0.5 font-bold tabular-nums">{formatCurrency(liability.taxableValue)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total GST (18%)
            </p>
            <p
              className={cn(
                "mt-0.5 font-bold tabular-nums",
                cardStatus === "overdue" && "text-destructive"
              )}
            >
              {formatCurrency(liability.total)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              CGST + SGST
            </p>
            <p className="mt-0.5 text-sm tabular-nums">
              {formatCurrency(liability.cgst)} + {formatCurrency(liability.sgst)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Delivery date
            </p>
            <p className="mt-0.5 text-sm">{formatGSTDate(timeline.deliveryDate)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              GST due date
            </p>
            <p
              className={cn(
                "mt-0.5 text-sm font-semibold",
                cardStatus === "overdue" && "text-destructive"
              )}
            >
              {formatGSTDate(liability.dueDate)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all", statusConfig.progress)}
              style={{ width: `${statusConfig.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between",
          statusConfig.footerBg
        )}
      >
        <p className={cn("flex items-center gap-2 text-xs font-medium", statusConfig.footerText)}>
          {cardStatus === "healthy" ? (
            <CheckCircle2 className="size-3.5" />
          ) : (
            <span
              className={cn(
                "size-2 rounded-full",
                cardStatus === "overdue" ? "bg-red-500" : "bg-amber-500"
              )}
            />
          )}
          {statusConfig.footerMsg}
        </p>
        {cardStatus === "overdue" && (
          <p className="text-xs text-red-600 dark:text-red-400">
            GST due {formatGSTDate(liability.dueDate)} — payment not yet received (
            {formatCurrency(order.totalValue)} pending)
          </p>
        )}
        {cardStatus === "pending" && (
          <p className="text-xs text-muted-foreground">Status: Pending government transfer</p>
        )}
      </div>
    </div>
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

  const toolTabs: { key: ToolTab; label: string; icon: typeof Calculator }[] = [
    { key: "gst", label: "GST Planner", icon: Calculator },
    { key: "freight", label: "Freight Calculator", icon: Truck },
    { key: "floor", label: "Floor Price", icon: DollarSign },
    { key: "scaling", label: "Scaling Plan", icon: TrendingUp },
  ];

  return (
    <PageShell className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Payments & Taxes
        </h1>
        <p className="text-sm text-muted-foreground">
          Financial command center — manage GST, freight, and cash flow.
        </p>
      </div>

      {/* Row 1: Cash flow + metric stack */}
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="rounded-2xl border bg-card p-6 shadow-sm lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Cash Flow Dynamics</p>
              <p className="text-xs text-muted-foreground">Inflow vs outflow — last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" /> Inflow
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-400" /> Outflow
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
                    rx="3"
                    className="fill-emerald-500"
                    opacity="0.9"
                  />
                  <rect
                    x={barLeft + barW + gap}
                    y={baseY - outH}
                    width={barW}
                    height={outH}
                    rx="3"
                    className="fill-amber-400"
                    opacity="0.9"
                  />
                  <text
                    x={centerX}
                    y="190"
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
          <div className="mt-4 flex items-center gap-8 border-t pt-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total Inflow</p>
              <p className="font-bold text-emerald-600">{formatLakhs(totalInflow)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Outflow</p>
              <p className="font-bold text-amber-600">{formatLakhs(totalOutflow)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Cash</p>
              <p className="font-bold">{formatLakhs(netCash)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-span-5">
          {[
            {
              label: "Total GST Due (This Month)",
              value: formatCurrency(gstSummary.totalGSTDue),
              trend: "+₹1,04,400 upcoming",
              trendColor: "text-amber-600",
              desc: "Consolidated CGST + SGST liabilities",
              border: "border-l-4 border-l-amber-400",
            },
            {
              label: "Total Taxable Value",
              value: formatCurrency(summary.totalRevenue),
              trend: "Across 3 active government contracts",
              trendColor: "text-muted-foreground",
              desc: "Total invoice value of current orders",
              border: "border-l-4 border-l-blue-400",
            },
            {
              label: "Payments Received",
              value: formatCurrency(summary.received),
              trend: "100% Secure",
              trendColor: "text-emerald-600",
              desc: "Transferred directly to bank account",
              border: "border-l-4 border-l-emerald-400",
            },
            {
              label: "Payments Pending",
              value: formatCurrency(summary.pending + summary.stuck),
              trend: "2 Orders Pending",
              trendColor: "text-amber-600",
              desc: "GST due timeline aligned",
              border: "border-l-4 border-l-violet-400",
            },
          ].map(({ label, value, trend, trendColor, desc, border }) => (
            <div
              key={label}
              className={cn("rounded-2xl border bg-card px-5 py-4 shadow-sm", border)}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-xl font-extrabold tabular-nums">{value}</p>
                <span className={cn("text-[10px] font-semibold", trendColor)}>{trend}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Alerts + quick actions */}
      <div className="grid gap-5 lg:grid-cols-12">
        {gstSummary.gap > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between lg:col-span-5 dark:border-red-900 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
              <div>
                <p className="font-bold text-red-700 dark:text-red-400">Critical Cash Gap Alert</p>
                <p className="mt-1 text-xs leading-relaxed text-red-600 dark:text-red-300">
                  You need {formatCurrency(gstSummary.gap)} for GST before payments arrive.
                </p>
              </div>
            </div>
            <Link
              href="/msme-rights"
              className="shrink-0 rounded-xl border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900"
            >
              Learn more
            </Link>
          </div>
        )}

        {summary.totalInterest > 0 && (
          <div
            className={cn(
              "flex flex-col gap-3 rounded-2xl bg-primary p-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between",
              gstSummary.gap > 0 ? "lg:col-span-3" : "lg:col-span-7"
            )}
          >
            <div>
              <p className="text-sm font-bold">Owed {formatCurrency(summary.totalInterest)} in interest</p>
              <p className="mt-1 text-xs text-primary-foreground/80">
                MSMED Act Section 16 — compound interest at 3× RBI rate
              </p>
            </div>
            <Link
              href="/msme-rights"
              className="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-primary transition hover:bg-white/90"
            >
              Generate Legal Notice
            </Link>
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl border bg-card p-5 shadow-sm",
            gstSummary.gap > 0 && summary.totalInterest > 0
              ? "lg:col-span-4"
              : gstSummary.gap > 0 || summary.totalInterest > 0
                ? "lg:col-span-8"
                : "lg:col-span-12"
          )}
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Quick actions
          </p>
          <div className="space-y-1">
            {[
              { href: "/msme-rights", label: "Draft Legal Notice", icon: Gavel },
              { href: "/msme-rights", label: "MSME Rights Guide", icon: Scale },
              { href: "/orders", label: "View All Orders", icon: Package },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 rounded-lg p-2.5 text-xs font-semibold transition hover:bg-muted/50"
              >
                <Icon className="size-4 text-primary" />
                {label}
                <ArrowUpRight className="ml-auto size-3 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: GST Planner section */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-2 overflow-x-auto border-b bg-muted/20 px-5 py-3">
          <div className="flex items-center gap-2">
            {toolTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setToolTab(key)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all",
                  toolTab === key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/80"
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
          <button className="flex shrink-0 items-center gap-1 rounded-lg border bg-card px-3 py-1.5 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted/50">
            <SlidersHorizontal className="size-3" />
            Filter
          </button>
        </div>

        <div className="p-6">
          {toolTab === "gst" && (
            <div className="space-y-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                <AlertTriangle className="mb-0.5 inline size-4" aria-hidden="true" />{" "}
                <strong>GST must be paid by the 20th of the next month</strong> regardless of
                whether the government buyer has paid you yet. Ensure your cash flow is managed
                accordingly.
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold">GST Payment Scheduler & Orders</h2>
                  <p className="text-xs text-muted-foreground">
                    Track GST liabilities against payment timelines
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 rounded-xl border bg-card px-3 py-2 text-xs font-semibold transition hover:bg-muted/50">
                    <SlidersHorizontal className="size-3.5" />
                    Filter Orders
                  </button>
                  <button className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90">
                    <Download className="size-3.5" />
                    Export GSTR-1
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {orders.map((order) => (
                  <GSTOrderCard key={order.id} order={order} />
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
      </div>

      {/* MSMED footer note */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-1.5">
          <Scale className="size-3.5 text-primary" />
          <p className="text-xs font-bold">MSMED Act rights</p>
        </div>
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          Pay within <strong className="text-foreground">{MSMED_PAYMENT_PERIOD_DAYS} days</strong>{" "}
          of accepting goods. After that, compound interest at{" "}
          <strong className="text-foreground">3× RBI rate</strong> (~
          {(PENALTY_RATE_ANNUAL * 100).toFixed(2)}% p.a.). Escalate: consignee → GeM → CPGRAMS →
          MSME Samadhaan.
        </p>
        <p className="mt-1 text-[8px] text-muted-foreground">{SOURCE_MSMED_RBI}</p>
      </div>
    </PageShell>
  );
}

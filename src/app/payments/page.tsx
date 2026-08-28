"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Calculator,
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  FileText,
  Gavel,
  IndianRupee,
  Scale,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";

import { getAccountPayments } from "@/lib/demo-data";
import { GSTPlanner } from "@/components/GSTPlanner";
import { FreightCalculator } from "@/components/FreightCalculator";
import { FloorPriceCalculator } from "@/components/FloorPriceCalculator";
import { ScalingCalculator } from "@/components/ScalingCalculator";
import { PageShell } from "@/components/PageShell";
import { PaymentAlert } from "@/components/PaymentAlert";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

type ToolTab = "gst" | "freight" | "floor" | "scaling";

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
    case "paid": return "Paid";
    case "stuck": return "Stuck";
    case "overdue": return "Overdue";
    default: return "Pending";
  }
}

function statusDot(status: PaymentOrder["status"]): string {
  switch (status) {
    case "paid": return "bg-emerald-500";
    case "stuck": return "bg-amber-500";
    case "overdue": return "bg-red-500";
    default: return "bg-slate-400";
  }
}

function statusBadgeClass(status: PaymentOrder["status"]): string {
  switch (status) {
    case "paid": return "status-badge status-badge--success";
    case "stuck": return "status-badge status-badge--warning";
    case "overdue": return "status-badge status-badge--danger";
    default: return "status-badge status-badge--neutral";
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
  return [
    { key: "order", label: "Order", date: order.orderDate, done: true, active: false },
    { key: "delivery", label: "Delivery", date: order.deliveryDate, done: true, active: !cracDone && !paid },
    { key: "crac", label: "CRAC", date: order.cracDate, done: cracDone, active: cracDone && !invoiceDone && !paid },
    { key: "invoice", label: "Invoice", date: order.invoiceDate, done: invoiceDone, active: invoiceDone && !paid },
    { key: "payment", label: "Payment", date: order.paymentDate, done: paid, active: paid },
  ];
}

/* ── FINNIE INVOICE PREVIEW — right detail panel ── */
function PaymentDetailPanel({ order, onClose }: { order: PaymentOrder; onClose: () => void }) {
  const [showClaim, setShowClaim] = useState(false);
  const rights = checkPaymentRights(order);
  const escalation = getEscalationSteps(order);
  const timeline = getPaymentTimeline(order);
  const totalDays =
    order.status === "paid" && order.paymentDate
      ? daysBetween(order.orderDate, order.paymentDate)
      : daysBetween(order.deliveryDate);

  const gstRate = 18;
  const gstAmount = Math.round(order.totalValue * gstRate / 100);
  const interestAmount = rights.eligible ? rights.interestAmount : 0;

  return (
    <div className="h-full overflow-y-auto border-l bg-muted/5">
      {/* Header with action buttons — Finnie style */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-sm font-bold">Preview</p>
          <p className="text-[10px] text-muted-foreground">{order.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={statusBadgeClass(order.status)}><span className={cn("size-1.5 rounded-full", statusDot(order.status))} />{statusLabel(order.status)}</span>
          <button onClick={onClose} className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Invoice preview card — white card on gray bg like Finnie */}
      <div className="p-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-card">
          {/* Invoice header */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="text-lg font-extrabold">Invoice</h2>
              <p className="text-[10px] text-muted-foreground">Invoice Number <span className="font-semibold text-foreground">#{order.id}</span></p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="size-4 text-primary" />
            </div>
          </div>

          {/* Billed by / Billed to — Finnie two-column */}
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-[10px] font-semibold text-muted-foreground">Billed by:</p>
              <p className="text-xs font-bold">GeM Portal</p>
              <p className="text-[10px] text-muted-foreground">gems.gov.in</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Government e-Marketplace<br />New Delhi, India</p>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold text-muted-foreground">Billed to:</p>
              <p className="text-xs font-bold">Your Business</p>
              <p className="text-[10px] text-muted-foreground">seller@business.com</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{order.department}</p>
            </div>
          </div>

          {/* Dates — Finnie style */}
          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-muted-foreground">Date Issued:</p>
              <p className="text-xs font-semibold">{formatDate(order.orderDate)}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Due Date:</p>
              <p className="text-xs font-semibold">{formatDate(order.deliveryDate)}</p>
            </div>
          </div>

          {/* Items table — Finnie style with QTY/Rate/Total */}
          <div className="mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left text-[10px] font-semibold text-muted-foreground">Items</th>
                  <th className="pb-2 text-center text-[10px] font-semibold text-muted-foreground">QTY</th>
                  <th className="pb-2 text-right text-[10px] font-semibold text-muted-foreground">Rate</th>
                  <th className="pb-2 text-right text-[10px] font-semibold text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2.5 font-medium">{order.bidTitle}</td>
                  <td className="py-2.5 text-center">1</td>
                  <td className="py-2.5 text-right tabular-nums">{formatCurrency(order.totalValue)}</td>
                  <td className="py-2.5 text-right font-semibold tabular-nums">{formatCurrency(order.totalValue)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals — Finnie Subtotal/Tax/Discount/Total */}
          <div className="border-t pt-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatCurrency(order.totalValue)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST ({gstRate}%)</span><span className="tabular-nums">{formatCurrency(gstAmount)}</span></div>
              {interestAmount > 0 && (
                <div className="flex justify-between"><span className="text-destructive">MSMED Interest</span><span className="tabular-nums text-destructive">+{formatCurrency(interestAmount)}</span></div>
              )}
              <div className="flex justify-between border-t pt-1.5"><span className="font-bold">Total</span><span className="text-sm font-bold tabular-nums">{formatCurrency(order.totalValue + gstAmount + interestAmount)}</span></div>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-4 rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-[10px] text-muted-foreground">Payment Status</p>
            <div className="mt-1"><span className={statusBadgeClass(order.status)}><span className={cn("size-1.5 rounded-full", statusDot(order.status))} />{statusLabel(order.status)}</span></div>
          </div>

          {/* Notes — Finnie style */}
          <div className="mt-4 rounded-lg border border-dashed p-3">
            <p className="mb-1 text-[10px] font-semibold text-muted-foreground">Notes:</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Payment due within {MSMED_PAYMENT_PERIOD_DAYS} days per MSMED Act Section 15. After that, compound interest at 3× RBI rate applies. CRAC must be generated for payment processing.
            </p>
          </div>
        </div>

        {/* Timeline — below invoice card */}
        <div className="mt-4 rounded-xl border bg-card p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Timeline</p>
          <ol className="relative ml-1 space-y-0 border-l-2 border-muted">
            {timeline.map((step) => (
              <li key={step.key} className="relative flex gap-2 pb-2.5 pl-3 last:pb-0">
                <span className="absolute -left-[6px] top-0.5 bg-card">
                  {step.done ? <CheckCircle2 className="size-3 text-emerald-500" /> : step.active ? <Clock className="size-3 text-amber-500" /> : <Circle className="size-3 text-muted-foreground/30" />}
                </span>
                <div>
                  <p className={cn("text-[10px]", step.done ? "font-medium" : "text-muted-foreground")}>{step.label}</p>
                  {step.date && <p className="text-[8px] text-muted-foreground">{formatDate(step.date)}</p>}
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[9px] text-muted-foreground">{totalDays} days {order.status === "paid" ? "order → payment" : "since delivery"}</p>
        </div>

        {/* Alerts */}
        {order.status === "stuck" && (
          <div className="mt-3"><Alert><AlertTriangle className="size-3" /><AlertTitle className="text-[10px]">CRAC not generated</AlertTitle><AlertDescription className="text-[9px]">Payment cannot proceed until acceptance is recorded.</AlertDescription></Alert></div>
        )}
        {order.status === "overdue" && <div className="mt-3"><PaymentAlert order={order} /></div>}

        {/* MSMED Rights + Claim */}
        <div className="mt-3 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Scale className="size-3.5 text-primary" />
            <p className="text-[10px] font-bold">MSMED Act Rights</p>
          </div>
          <div className="space-y-1 text-[9px] text-muted-foreground">
            <p>Pay within <strong className="text-foreground">{MSMED_PAYMENT_PERIOD_DAYS} days</strong> of accepting goods.</p>
            <p>After that, compound interest at <strong className="text-foreground">3× RBI rate</strong> is legally due.</p>
          </div>
          {rights.eligible && rights.interestAmount > 0 && (
            <div className="mt-2 pt-2 border-t flex justify-between">
              <p className="text-[9px] font-semibold text-destructive">Interest owed</p>
              <p className="text-xs font-bold text-destructive tabular-nums">{formatCurrency(rights.interestAmount)}</p>
            </div>
          )}
          {rights.eligible && (order.status === "stuck" || order.status === "overdue") && (
            <div className="mt-2 pt-2 border-t">
              <button type="button" className="flex w-full items-center gap-1.5 rounded-lg border bg-primary/5 p-2 text-[10px] font-semibold transition hover:bg-primary/10" onClick={() => setShowClaim((v) => !v)}>
                <Gavel className="size-3 text-primary" />File Claim
              </button>
              {showClaim && (
                <ol className="mt-2 space-y-1 pl-0.5">
                  {escalation.map((step, i) => (
                    <li key={step} className="flex gap-1 text-[9px]">
                      <span className="flex size-3 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[7px] font-bold text-primary">{i + 1}</span>{step}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
          <Link href="/msme-rights" className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg gradient-cta py-2 text-[10px] font-semibold text-white">
            <FileText className="size-3" />Generate Legal Notice
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const orders = useAccountPayments();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const summary = useMemo(() => {
    let received = 0, pending = 0, stuck = 0, totalInterest = 0;
    for (const order of orders) {
      if (order.status === "paid") received += order.totalValue;
      else if (order.status === "stuck" || order.status === "overdue") {
        stuck += order.totalValue;
        totalInterest += checkPaymentRights(order).interestAmount;
      } else pending += order.totalValue;
    }
    return { received, pending, stuck, totalInterest };
  }, [orders]);

  const gstSummary = useMemo(() => checkCashGap(orders, 119_160), [orders]);
  const selectedOrder = orders.find((o) => o.id === selectedId) ?? null;
  const paidCount = orders.filter((o) => o.status === "paid").length;
  const unpaidCount = orders.filter((o) => o.status !== "paid").length;

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter((o) =>
      o.id.toLowerCase().includes(q) ||
      o.bidTitle.toLowerCase().includes(q) ||
      o.department.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const [toolTab, setToolTab] = useState<ToolTab>("gst");

  const toolTabs: { key: ToolTab; label: string; icon: typeof Calculator }[] = [
    { key: "gst", label: "GST Planner", icon: Calculator },
    { key: "freight", label: "Freight Calculator", icon: Truck },
    { key: "floor", label: "Floor Price", icon: DollarSign },
    { key: "scaling", label: "Scaling Plan", icon: TrendingUp },
  ];

  return (
    <PageShell wide className="space-y-5">
      {/* ── BREADCRUMB + TITLE ── */}
      <div>
        <p className="text-xs text-muted-foreground">
          Sahayak <span className="mx-1">›</span> <span className="font-semibold text-foreground">Payments</span>
        </p>
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight sm:text-3xl">Payments</h1>
      </div>

      {/* ── STAT CARDS — with colored left accent borders ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border bg-card p-4 pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-blue-500 before:to-blue-400">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Total Invoices</p>
            <span className="rounded-full bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-600">↗</span>
          </div>
          <p className="text-xl font-extrabold tabular-nums">{formatCurrency(summary.received + summary.pending + summary.stuck)}</p>
          <p className="mt-0.5 text-[9px] text-muted-foreground">Invoices this month</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border bg-card p-4 pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-emerald-500 before:to-emerald-400">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Paid Invoices</p>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">↗</span>
          </div>
          <p className="text-xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-400">{formatCurrency(summary.received)}</p>
          <p className="mt-0.5 text-[9px] text-muted-foreground">from {paidCount} invoices</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border bg-card p-4 pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-amber-500 before:to-amber-400">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Unpaid Invoices</p>
            <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">⚠</span>
          </div>
          <p className="text-xl font-extrabold tabular-nums text-amber-700 dark:text-amber-400">{formatCurrency(summary.pending + summary.stuck)}</p>
          <p className="mt-0.5 text-[9px] text-muted-foreground">from {unpaidCount} invoices</p>
        </div>
        <div className="relative overflow-hidden rounded-xl border bg-card p-4 pl-5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-violet-500 before:to-violet-400">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">GST Liability</p>
            <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px] font-bold text-violet-600">📊</span>
          </div>
          <p className="text-xl font-extrabold tabular-nums text-violet-700 dark:text-violet-400">{formatCurrency(gstSummary.totalGSTDue)}</p>
          <p className="mt-0.5 text-[9px] text-muted-foreground">due by 20th of next month</p>
        </div>
      </div>

      {/* ── CASH GAP ALERT ── */}
      {gstSummary.gap > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-3.5 text-red-600" />
            <div>
              <p className="text-xs font-bold text-red-700">Cash gap alert</p>
              <p className="text-[10px] text-red-600">You need {formatCurrency(gstSummary.gap)} for GST before payments arrive. GST must be paid by the 20th of next month regardless of payment status.</p>
            </div>
          </div>
          <Link href="/msme-rights" className="shrink-0 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-[10px] font-semibold text-red-700 transition hover:bg-red-100">Learn more</Link>
        </div>
      )}

      {/* ── MSMED INTEREST BANNER ── */}
      {summary.totalInterest > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-start gap-2">
            <IndianRupee className="mt-0.5 size-3.5 text-destructive" />
            <div>
              <p className="text-xs font-bold text-destructive">Owed {formatCurrency(summary.totalInterest)} in interest</p>
              <p className="text-[9px] text-muted-foreground">MSMED Act Section 16 — compound interest at 3× RBI rate</p>
            </div>
          </div>
          <Link href="/msme-rights" className="shrink-0 rounded-lg gradient-cta px-3 py-1.5 text-[10px] font-semibold text-white">Generate Legal Notice</Link>
        </div>
      )}

      {/* ── PAYFAST SPLIT VIEW ── */}
      <div className="flex gap-0 rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className={cn("flex-1 overflow-hidden transition-all duration-300", selectedOrder && "lg:max-w-[55%]")}>
          {/* Integrated search + filter bar */}
          <div className="flex items-center gap-3 border-b bg-muted/20 px-4 py-2.5">
            <p className="text-sm font-bold shrink-0">All Invoices</p>
            <div className="flex-1" />
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-48 rounded-lg border bg-background pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-ring/50 focus:w-64 transition-all"
              />
            </div>
            <button className="flex items-center gap-1 rounded-lg border bg-card px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground transition hover:bg-muted/50">
              <SlidersHorizontal className="size-3" />
              Filter
            </button>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-6"><EmptyState icon={IndianRupee} title="No payments found" description="No invoices match your search." actions={[{ label: "Clear search", onClick: () => setSearchQuery(""), variant: "outline" as const }]} /></div>
          ) : (
            <>
              {/* Table header */}
              <div className="hidden border-b bg-muted/10 md:grid md:grid-cols-12 px-4 py-2 gap-2">
                <div className="col-span-1" />
                <div className="col-span-4 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice</div>
                <div className="col-span-3 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Name</div>
                <div className="col-span-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Date</div>
                <div className="col-span-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
                <div className="col-span-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Amount</div>
              </div>

              {/* Table rows */}
              {filteredOrders.map((order, index) => {
                const isSelected = selectedId === order.id;
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => setSelectedId(isSelected ? null : order.id)}
                    className={cn(
                      "w-full border-b text-left transition-all last:border-b-0",
                      isSelected
                        ? "bg-primary/5 border-l-2 border-l-primary"
                        : index % 2 === 0
                          ? "hover:bg-muted/20"
                          : "bg-muted/5 hover:bg-muted/15"
                    )}
                  >
                    {/* Mobile */}
                    <div className="flex items-center gap-2.5 p-3 md:hidden">
                      <span className={cn("size-2 rounded-full shrink-0", statusDot(order.status))} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate">{order.id}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{order.bidTitle}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold tabular-nums">{formatCurrency(order.totalValue)}</p>
                        <span className={statusBadgeClass(order.status)}>{statusLabel(order.status)}</span>
                      </div>
                    </div>
                    {/* Desktop */}
                    <div className="hidden md:grid md:grid-cols-12 md:items-center px-4 py-3 gap-2">
                      <div className="col-span-1"><span className={cn("size-2 rounded-full inline-block", statusDot(order.status))} /></div>
                      <div className="col-span-4">
                        <p className={cn("text-xs", isSelected ? "font-bold text-primary" : "font-bold")}>{order.id}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{order.bidTitle}</p>
                      </div>
                      <div className="col-span-3 text-[10px] text-muted-foreground truncate">{order.department}</div>
                      <div className="col-span-2 text-[10px] text-muted-foreground">{formatDate(order.orderDate)}</div>
                      <div className="col-span-1"><span className={statusBadgeClass(order.status)}>{statusLabel(order.status)}</span></div>
                      <div className="col-span-1 text-right text-xs font-bold tabular-nums">{formatCurrency(order.totalValue)}</div>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* RIGHT — detail panel */}
        {selectedOrder && (
          <div className="hidden lg:block lg:w-[45%] lg:min-w-[340px] slide-in-forward">
            <PaymentDetailPanel order={selectedOrder} onClose={() => setSelectedId(null)} />
          </div>
        )}
      </div>

      {/* Mobile detail */}
      {selectedOrder && (
        <div className="lg:hidden rounded-xl border bg-card shadow-sm overflow-hidden slide-in-forward">
          <PaymentDetailPanel order={selectedOrder} onClose={() => setSelectedId(null)} />
        </div>
      )}

      {/* ── Cash flow chart + Quick actions ── */}
      <div className="grid gap-3 md:grid-cols-12">
        <div className="rounded-xl border bg-card p-5 md:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Cash flow — last 6 months</p>
              <p className="text-xs text-muted-foreground">Inflow vs outflow by month</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500" /> Inflow</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-amber-400" /> Outflow</span>
              <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Net</span>
            </div>
          </div>
          {/* SVG Chart */}
          <div className="relative">
            <svg viewBox="0 0 580 210" className="w-full" aria-label="Cash flow chart">
              {/* Layout constants:
                  chartLeft=50, chartRight=570, chartTop=10, chartBottom=170
                  chartWidth=520, chartHeight=160
                  6 months → 520/6 ≈ 86.67px each
                  groupCenter(i) = 50 + 43.33 + i*86.67
              */}

              {/* Grid lines — aligned with Y-axis labels */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="50" y1={10 + i * 40} x2="570" y2={10 + i * 40} stroke="currentColor" className="text-muted/30" strokeWidth="0.5" strokeDasharray="3 3" />
              ))}

              {/* Y-axis labels — right-aligned to chart left edge */}
              {["₹8L", "₹6L", "₹4L", "₹2L", "₹0"].map((label, i) => (
                <text key={label} x="46" y={14 + i * 40} textAnchor="end" className="fill-muted-foreground" fontSize="9" fontWeight="500">{label}</text>
              ))}

              {/* Bars + labels + net dots */}
              {([
                { month: "Mar", inflow: 210000, outflow: 85000 },
                { month: "Apr", inflow: 350000, outflow: 120000 },
                { month: "May", inflow: 180000, outflow: 95000 },
                { month: "Jun", inflow: 580000, outflow: 150000 },
                { month: "Jul", inflow: 420000, outflow: 180000 },
                { month: "Aug", inflow: 912000, outflow: 210000 },
              ] as const).map((d, i) => {
                const centerX = 93 + i * 87; // center of each group
                const barW = 22;
                const gap = 3;
                const totalBarW = barW * 2 + gap;
                const barLeft = centerX - totalBarW / 2;
                const maxVal = 1000000;
                const chartH = 160;
                const baseY = 170;
                const inH = (d.inflow / maxVal) * chartH;
                const outH = (d.outflow / maxVal) * chartH;
                const net = d.inflow - d.outflow;
                const netY = baseY - (net / maxVal) * chartH;

                return (
                  <g key={d.month}>
                    {/* Inflow bar */}
                    <rect x={barLeft} y={baseY - inH} width={barW} height={inH} rx="3" className="fill-emerald-500" opacity="0.9">
                      <title>{`Inflow: ₹${(d.inflow / 100000).toFixed(1)}L`}</title>
                    </rect>
                    {/* Outflow bar */}
                    <rect x={barLeft + barW + gap} y={baseY - outH} width={barW} height={outH} rx="3" className="fill-amber-400" opacity="0.9">
                      <title>{`Outflow: ₹${(d.outflow / 100000).toFixed(1)}L`}</title>
                    </rect>
                    {/* Net dot — centered between the two bars */}
                    <circle cx={centerX} cy={netY} r="3.5" className="fill-primary" stroke="white" strokeWidth="1.5">
                      <title>{`Net: ₹${(net / 100000).toFixed(1)}L`}</title>
                    </circle>
                    {/* Net amount label — above dot, with background */}
                    <text x={centerX} y={netY - 10} textAnchor="middle" className="fill-primary" fontSize="9" fontWeight="700">₹{(net / 100000).toFixed(1)}L</text>
                    {/* Month label — below baseline */}
                    <text x={centerX} y="190" textAnchor="middle" className="fill-muted-foreground" fontSize="11" fontWeight="500">{d.month}</text>
                  </g>
                );
              })}

              {/* Net trend line — connecting the net dots */}
              <polyline
                points={([
                  { month: "Mar", inflow: 210000, outflow: 85000 },
                  { month: "Apr", inflow: 350000, outflow: 120000 },
                  { month: "May", inflow: 180000, outflow: 95000 },
                  { month: "Jun", inflow: 580000, outflow: 150000 },
                  { month: "Jul", inflow: 420000, outflow: 180000 },
                  { month: "Aug", inflow: 912000, outflow: 210000 },
                ] as const).map((d, i) => {
                  const cx = 93 + i * 87;
                  const net = d.inflow - d.outflow;
                  const cy = 170 - (net / 1000000) * 160;
                  return `${cx},${cy}`;
                }).join(" ")}
                fill="none"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity="0.4"
              />
            </svg>
          </div>
          {/* Summary row */}
          <div className="mt-3 flex items-center gap-6 border-t pt-3 text-xs">
            <div>
              <p className="text-muted-foreground">Total inflow</p>
              <p className="font-bold text-emerald-600">₹{(210000 + 350000 + 180000 + 580000 + 420000 + 912000) / 100000}L</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total outflow</p>
              <p className="font-bold text-amber-600">₹{(85000 + 120000 + 95000 + 150000 + 180000 + 210000) / 100000}L</p>
            </div>
            <div>
              <p className="text-muted-foreground">Net cash</p>
              <p className="font-bold text-primary">₹{((210000 + 350000 + 180000 + 580000 + 420000 + 912000) - (85000 + 120000 + 95000 + 150000 + 180000 + 210000)) / 100000}L</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:col-span-4">
          <div className="rounded-xl border bg-card p-4 flex-1">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick actions</p>
            <div className="space-y-1">
              <Link href="/msme-rights" className="flex items-center gap-2 rounded-lg p-2.5 text-xs font-semibold transition hover:bg-muted/50"><Gavel className="size-4 text-primary" />Legal notice<ArrowUpRight className="ml-auto size-3 text-muted-foreground" /></Link>
              <Link href="/msme-rights" className="flex items-center gap-2 rounded-lg p-2.5 text-xs font-semibold transition hover:bg-muted/50"><Scale className="size-4 text-primary" />MSME rights<ArrowUpRight className="ml-auto size-3 text-muted-foreground" /></Link>
              <Link href="/orders" className="flex items-center gap-2 rounded-lg p-2.5 text-xs font-semibold transition hover:bg-muted/50"><IndianRupee className="size-4 text-primary" />All orders<ArrowUpRight className="ml-auto size-3 text-muted-foreground" /></Link>
            </div>
          </div>
          {/* Net cash summary card */}
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-4">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">Net cash position</p>
            <p className="mt-1 text-2xl font-extrabold text-primary">₹{((210000 + 350000 + 180000 + 580000 + 420000 + 912000) - (85000 + 120000 + 95000 + 150000 + 180000 + 210000)) / 100000}L</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">6-month cumulative</p>
          </div>
        </div>
      </div>

      {/* ── CALCULATOR TOOLS — tabbed section ── */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="flex items-center gap-1 overflow-x-auto border-b bg-muted/20 px-4 py-2">
          {toolTabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setToolTab(key)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all",
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
        <div className="p-4">
          {toolTab === "gst" && (
            <div>
              <GSTPlanner />
            </div>
          )}
          {toolTab === "freight" && (
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Freight Decoupler Calculator</p>
              <FreightCalculator />
            </div>
          )}
          {toolTab === "floor" && (
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Reverse Auction Floor Price</p>
              <FloorPriceCalculator />
            </div>
          )}
          {toolTab === "scaling" && (
            <div>
              <p className="mb-3 text-sm font-semibold text-foreground">Revenue Scaling Plan</p>
              <ScalingCalculator />
            </div>
          )}
        </div>
      </div>

      {/* ── MSMED ACT RIGHTS ── */}
      <div className="rounded-xl border bg-card p-4">
        <div className="flex items-center gap-1.5 mb-2">
          <Scale className="size-3.5 text-primary" />
          <p className="text-xs font-bold">MSMED Act rights</p>
        </div>
        <div className="space-y-1.5 text-[10px] text-muted-foreground">
          <p>Pay within <strong className="text-foreground">{MSMED_PAYMENT_PERIOD_DAYS} days</strong> of accepting goods. After that, compound interest at <strong className="text-foreground">3× RBI rate</strong> (~{(PENALTY_RATE_ANNUAL * 100).toFixed(2)}% p.a.).</p>
          <p>Escalate: consignee → GeM → CPGRAMS → MSME Samadhaan.</p>
          <p className="text-amber-600">⚠ CRAC is critical — without it, the payment clock never starts.</p>
          <Link href="/msme-rights" className="inline-flex items-center rounded-lg border px-2.5 py-1 text-[9px] font-semibold transition hover:bg-muted/50">Read full MSME rights guide →</Link>
          <p className="text-[8px] text-muted-foreground">{SOURCE_MSMED_RBI}</p>
        </div>
      </div>
    </PageShell>
  );
}

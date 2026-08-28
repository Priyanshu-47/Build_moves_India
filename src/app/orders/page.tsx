"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { getAccountOrders } from "@/lib/demo-data";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type Order = ReturnType<typeof getAccountOrders>[number];
type OrderTab = "all" | "confirmed" | "in_transit" | "delivered";

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

function statusLabel(status: Order["status"]): string {
  switch (status) {
    case "delivered": return "Delivered";
    case "in_transit": return "In Transit";
    default: return "Confirmed";
  }
}

function statusDot(status: Order["status"]): string {
  switch (status) {
    case "delivered": return "bg-emerald-500";
    case "in_transit": return "bg-blue-500";
    default: return "bg-slate-400";
  }
}

function statusBadge(status: Order["status"]): string {
  switch (status) {
    case "delivered": return "status-badge status-badge--success";
    case "in_transit": return "status-badge status-badge--info";
    default: return "status-badge status-badge--neutral";
  }
}

function paymentBadge(status: Order["paymentStatus"]): string {
  switch (status) {
    case "paid": return "status-badge status-badge--success";
    case "pending": return "status-badge status-badge--warning";
    default: return "status-badge status-badge--neutral";
  }
}

function paymentLabel(status: Order["paymentStatus"]): string {
  switch (status) {
    case "paid": return "Paid";
    case "pending": return "Pending";
    default: return "Not Due";
  }
}

function getTimeline(order: Order) {
  return [
    { label: "Order confirmed", date: order.orderDate, done: true },
    {
      label: "In transit",
      date: order.status !== "confirmed" ? order.orderDate : null,
      done: order.status === "in_transit" || order.status === "delivered",
    },
    {
      label: "Delivered",
      date: order.status === "delivered" ? order.deliveryDate : null,
      done: order.status === "delivered",
    },
    {
      label: "CRAC generated",
      date: order.cracGenerated ? order.deliveryDate : null,
      done: order.cracGenerated,
    },
    {
      label: "Payment received",
      date: order.paymentDate,
      done: order.paymentStatus === "paid",
    },
  ];
}

function progressPercent(order: Order): number {
  const steps = getTimeline(order);
  const done = steps.filter((s) => s.done).length;
  return Math.round((done / steps.length) * 100);
}

export default function OrdersPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const ordersData = useMemo(() => getAccountOrders(), []);

  const summary = useMemo(() => {
    const totalRevenue = ordersData.reduce((sum, order) => sum + order.totalValue, 0);
    const pendingPayments = ordersData.filter((o) => o.paymentStatus === "pending").length;
    const inTransit = ordersData.filter((o) => o.status === "in_transit").length;
    return { totalOrders: ordersData.length, totalRevenue, pendingPayments, inTransit };
  }, [ordersData]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return ordersData;
    return ordersData.filter((o) => o.status === activeTab);
  }, [ordersData, activeTab]);

  const tabCounts = useMemo(() => ({
    all: ordersData.length,
    confirmed: ordersData.filter((o) => o.status === "confirmed").length,
    in_transit: ordersData.filter((o) => o.status === "in_transit").length,
    delivered: ordersData.filter((o) => o.status === "delivered").length,
  }), [ordersData]);

  return (
    <PageShell wide className="space-y-4">
      {/* ── CLEAN PAGE HEADER — no gradient hero ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Order fulfilment
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            My orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track deliveries, CRAC acceptance, and payment status.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            <strong className="text-foreground">{summary.totalOrders}</strong> orders
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-emerald-600 font-semibold">{formatCurrency(summary.totalRevenue)} revenue</span>
          {summary.pendingPayments > 0 && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-amber-600 font-semibold">{summary.pendingPayments} pending</span>
            </>
          )}
        </div>
      </div>

      {/* ── LOADLOGIC STATUS TABS — prominent pill tabs ── */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { key: "all" as OrderTab, label: "All orders" },
          { key: "confirmed" as OrderTab, label: "Confirmed" },
          { key: "in_transit" as OrderTab, label: "In Transit" },
          { key: "delivered" as OrderTab, label: "Delivered" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-all",
              activeTab === key
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {label}
            <span className={cn(
              "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              activeTab === key
                ? "bg-white/20"
                : "bg-border text-muted-foreground"
            )}>
              {tabCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* ── LOADLOGIC-STYLE TABLE ── */}
      {ordersData.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 bg-card p-8 text-center">
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Your first order will appear here after you win a bid."
            actions={[
              { label: "Browse opportunities", action: "/opportunities" },
              { label: "View payments", action: "/payments", variant: "outline" },
            ]}
          />
        </div>
      ) : (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          {/* Table header — LoadLogic style */}
          <div className="hidden border-b bg-muted/30 md:grid md:grid-cols-12 gap-4 px-5 py-2.5">
            <div className="col-span-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Order</div>
            <div className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Department</div>
            <div className="col-span-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Value</div>
            <div className="col-span-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Date</div>
            <div className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
            <div className="col-span-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pay</div>
          </div>

          {filteredOrders.map((order) => {
            const expanded = expandedId === order.id;
            const progress = progressPercent(order);
            return (
              <div key={order.id} className="border-b last:border-b-0">
                <button
                  type="button"
                  className="w-full text-left transition-colors hover:bg-muted/20 md:px-5 md:py-3.5"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  aria-expanded={expanded}
                >
                  {/* Mobile */}
                  <div className="space-y-2 p-4 md:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{order.bidTitle}</p>
                        <p className="text-xs text-muted-foreground">{order.department}</p>
                      </div>
                      <span className={statusBadge(order.status)}>
                        <span className={cn("size-1.5 rounded-full", statusDot(order.status))} />
                        {statusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground tabular-nums">{formatCurrency(order.totalValue)}</span>
                      <span>·</span>
                      <span>{formatDate(order.orderDate)}</span>
                      <span>·</span>
                      <span className={paymentBadge(order.paymentStatus)}>{paymentLabel(order.paymentStatus)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="progress-track flex-1">
                        <div className={cn("progress-fill", progress === 100 ? "bg-emerald-500" : "bg-primary")} style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{progress}%</span>
                    </div>
                  </div>

                  {/* Desktop — LoadLogic table row */}
                  <div className="hidden md:grid md:grid-cols-12 md:items-center md:gap-4">
                    <div className="col-span-4 flex items-center gap-2.5 min-w-0">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Package className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{order.bidTitle}</p>
                        <p className="text-[10px] text-muted-foreground">{order.id}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground truncate">{order.department}</div>
                    <div className="col-span-1 text-xs font-semibold tabular-nums">{formatCurrency(order.totalValue)}</div>
                    <div className="col-span-1 text-[10px] text-muted-foreground">{formatDate(order.orderDate)}</div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className={statusBadge(order.status)}>
                        <span className={cn("size-1.5 rounded-full", statusDot(order.status))} />
                        {statusLabel(order.status)}
                      </span>
                      <div className="progress-track w-16">
                        <div className={cn("progress-fill", progress === 100 ? "bg-emerald-500" : "bg-primary")} style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold tabular-nums text-muted-foreground">{progress}%</span>
                    </div>
                    <div className="col-span-1 flex items-center justify-between">
                      <span className={paymentBadge(order.paymentStatus)}>
                        {paymentLabel(order.paymentStatus)}
                      </span>
                      <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
                    </div>
                  </div>
                </button>

                {/* ── EXPANDED DETAIL ── */}
                {expanded && (
                  <div className="border-t bg-muted/10 px-5 py-4 slide-in-forward">
                    <div className="grid gap-4 md:grid-cols-12">
                      <div className="md:col-span-5">
                        <p className="mb-2 text-xs font-bold">Delivery timeline</p>
                        <ol className="relative ml-1.5 space-y-0 border-l-2 border-muted">
                          {getTimeline(order).map((step) => (
                            <li key={step.label} className="relative flex gap-2.5 pb-3 pl-4 last:pb-0">
                              <span className="absolute -left-[7px] top-0.5 bg-card">
                                {step.done ? (
                                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                                ) : (
                                  <Circle className="size-3.5 text-muted-foreground/40" />
                                )}
                              </span>
                              <div>
                                <span className={cn("text-[11px]", step.done ? "font-medium" : "text-muted-foreground")}>{step.label}</span>
                                {step.date && <p className="text-[9px] text-muted-foreground">{formatDate(step.date)}</p>}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="md:col-span-7 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg bg-muted/40 p-2.5">
                            <p className="text-[10px] text-muted-foreground">Quantity</p>
                            <p className="font-semibold">{order.quantity} × {formatCurrency(order.unitPrice)}</p>
                          </div>
                          <div className="rounded-lg bg-muted/40 p-2.5">
                            <p className="text-[10px] text-muted-foreground">Total value</p>
                            <p className="font-semibold">{formatCurrency(order.totalValue)}</p>
                          </div>
                          <div className="rounded-lg bg-muted/40 p-2.5">
                            <p className="text-[10px] text-muted-foreground">CRAC</p>
                            <p className="font-semibold">
                              {order.cracGenerated ? <span className="text-emerald-600">Generated ✓</span> : <span className="text-amber-600">Pending</span>}
                            </p>
                          </div>
                          <div className="rounded-lg bg-muted/40 p-2.5">
                            <p className="text-[10px] text-muted-foreground">Payment</p>
                            <span className={paymentBadge(order.paymentStatus)}>{paymentLabel(order.paymentStatus)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

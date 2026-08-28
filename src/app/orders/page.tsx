"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Package,
  ShoppingBag,
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
    case "delivered":
      return "Delivered";
    case "in_transit":
      return "In Transit";
    default:
      return "Confirmed";
  }
}

function statusAccent(status: Order["status"]): string {
  switch (status) {
    case "delivered":
      return "border-l-emerald-500";
    case "in_transit":
      return "border-l-blue-500";
    default:
      return "border-l-slate-400";
  }
}

function statusBadge(status: Order["status"]): string {
  switch (status) {
    case "delivered":
      return "status-badge status-badge--success";
    case "in_transit":
      return "status-badge status-badge--info";
    default:
      return "status-badge status-badge--neutral";
  }
}

function paymentBadge(status: Order["paymentStatus"]): string {
  switch (status) {
    case "paid":
      return "status-badge status-badge--success";
    case "pending":
      return "status-badge status-badge--warning";
    default:
      return "status-badge status-badge--neutral";
  }
}

function paymentLabel(status: Order["paymentStatus"]): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Pending";
    default:
      return "Not Due";
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

export default function OrdersPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OrderTab>("all");
  const ordersData = useMemo(() => getAccountOrders(), []);

  const summary = useMemo(() => {
    const totalRevenue = ordersData.reduce((sum, order) => sum + order.totalValue, 0);
    const pendingPayments = ordersData.filter((o) => o.paymentStatus === "pending").length;
    return { totalOrders: ordersData.length, totalRevenue, pendingPayments };
  }, [ordersData]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return ordersData;
    return ordersData.filter((o) => o.status === activeTab);
  }, [ordersData, activeTab]);

  const tabCounts = useMemo(
    () => ({
      all: ordersData.length,
      confirmed: ordersData.filter((o) => o.status === "confirmed").length,
      in_transit: ordersData.filter((o) => o.status === "in_transit").length,
      delivered: ordersData.filter((o) => o.status === "delivered").length,
    }),
    [ordersData]
  );

  return (
    <PageShell className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Order fulfilment
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">My orders</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Track deliveries, CRAC acceptance, and payment status.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border bg-card px-4 py-2 text-xs font-semibold shadow-sm">
            <strong>{summary.totalOrders}</strong> orders
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
            {formatCurrency(summary.totalRevenue)} revenue
          </span>
          {summary.pendingPayments > 0 && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 shadow-sm dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
              {summary.pendingPayments} pending
            </span>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "all" as OrderTab, label: "All orders" },
            { key: "confirmed" as OrderTab, label: "Confirmed" },
            { key: "in_transit" as OrderTab, label: "In Transit" },
            { key: "delivered" as OrderTab, label: "Delivered" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={cn(
              "rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
              activeTab === key
                ? "bg-primary text-primary-foreground shadow-md"
                : "border bg-card text-muted-foreground hover:bg-muted/50"
            )}
          >
            {label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
                activeTab === key ? "bg-white/20" : "bg-muted"
              )}
            >
              {tabCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {ordersData.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-card p-10 text-center">
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
        <div className="space-y-5">
          {/* Column headers */}
          <div className="hidden px-5 md:grid md:grid-cols-12 md:gap-4">
            <div className="col-span-5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Order Details
            </div>
            <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Department
            </div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Value & Date
            </div>
            <div className="col-span-2 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Status
            </div>
          </div>

          {/* Order cards */}
          {filteredOrders.map((order) => {
            const expanded = expandedId === order.id;
            return (
              <div key={order.id} className="space-y-0">
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : order.id)}
                  className={cn(
                    "w-full rounded-2xl border border-l-[3px] bg-card p-5 text-left shadow-sm transition hover:shadow-md md:px-6 md:py-5",
                    statusAccent(order.status)
                  )}
                  aria-expanded={expanded}
                >
                  {/* Mobile */}
                  <div className="space-y-3 md:hidden">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Package className="size-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold leading-snug">{order.bidTitle}</p>
                        <p className="text-xs text-muted-foreground">{order.id}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.department}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold tabular-nums">{formatCurrency(order.totalValue)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(order.orderDate)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={statusBadge(order.status)}>{statusLabel(order.status)}</span>
                        <span className={cn(paymentBadge(order.paymentStatus), "gap-1")}>
                          {paymentLabel(order.paymentStatus)}
                          <ChevronDown className={cn("size-3", expanded && "rotate-180")} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden md:grid md:grid-cols-12 md:items-center md:gap-4">
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                        <Package className="size-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-bold">{order.bidTitle}</p>
                        <p className="text-xs text-muted-foreground">{order.id}</p>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <p className="truncate text-sm text-muted-foreground">{order.department}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="font-bold tabular-nums">{formatCurrency(order.totalValue)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(order.orderDate)}</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <span className={statusBadge(order.status)}>{statusLabel(order.status)}</span>
                      <span className={cn(paymentBadge(order.paymentStatus), "gap-1")}>
                        {paymentLabel(order.paymentStatus)}
                        <ChevronDown
                          className={cn("size-3 transition-transform", expanded && "rotate-180")}
                        />
                      </span>
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="mt-2 rounded-2xl border bg-muted/20 p-5">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Delivery timeline
                    </p>
                    <ol className="relative ml-2 space-y-0 border-l-2 border-muted">
                      {getTimeline(order).map((step) => (
                        <li key={step.label} className="relative flex gap-3 pb-4 pl-5 last:pb-0">
                          <span className="absolute -left-[9px] top-0.5 bg-muted/20">
                            {step.done ? (
                              <CheckCircle2 className="size-4 text-emerald-500" />
                            ) : (
                              <Circle className="size-4 text-muted-foreground/40" />
                            )}
                          </span>
                          <div>
                            <p
                              className={cn(
                                "text-sm",
                                step.done ? "font-medium" : "text-muted-foreground"
                              )}
                            >
                              {step.label}
                            </p>
                            {step.date && (
                              <p className="text-xs text-muted-foreground">
                                {formatDate(step.date)}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200">
        <span className="mt-0.5 text-sm">ℹ️</span>
        <div className="space-y-0.5">
          <p className="font-medium">Not affiliated with GeM. Prototype data for demonstration.</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400">
            Statistics: Source: Business Standard, Apr 2026. Legal claims: Source: MSMED Act 2006, RBI Dec 2025.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

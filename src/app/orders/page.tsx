"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";

import { getAccountOrders } from "@/lib/demo-data";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type Order = ReturnType<typeof getAccountOrders>[number];
type OrderTab = "all" | "confirmed" | "in_transit" | "delivered";

/** Shared grid so column headers and every row line up exactly */
const ORDER_GRID =
  "md:grid md:grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.1fr)] md:items-center md:gap-6";

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
      return "bg-emerald-500";
    case "in_transit":
      return "bg-blue-500";
    default:
      return "bg-slate-400";
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

const TABS: { key: OrderTab; label: string }[] = [
  { key: "all", label: "All orders" },
  { key: "confirmed", label: "Confirmed" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
];

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
    <PageShell className="pb-10 pt-2 md:pt-4">
      {/* Header */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Order fulfilment
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            My orders
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Track deliveries, CRAC acceptance, and payment status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end lg:pt-1">
          <span className="inline-flex h-9 items-center rounded-full border bg-card px-3.5 text-xs font-semibold text-foreground shadow-sm">
            <strong className="mr-1 tabular-nums">{summary.totalOrders}</strong>
            <span>orders</span>
          </span>
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
            <TrendingUp className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="tabular-nums">{formatCurrency(summary.totalRevenue)}</span>
            <span className="font-medium opacity-80">revenue</span>
          </span>
          {summary.pendingPayments > 0 && (
            <span className="inline-flex h-9 items-center rounded-full border border-amber-200 bg-amber-50 px-3.5 text-xs font-semibold text-amber-700 shadow-sm dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
              <span className="mr-1 tabular-nums">{summary.pendingPayments}</span>
              <span>pending</span>
            </span>
          )}
        </div>
      </header>

      {/* Gap above filters */}
      <div
        role="tablist"
        aria-label="Filter orders by status"
        className="mt-8 flex flex-wrap gap-2.5"
      >
        {TABS.map(({ key, label }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(key)}
              className={cn(
                "inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border bg-card text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <span>{label}</span>
              <span
                className={cn(
                  "ml-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  active
                    ? "bg-white/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tabCounts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Gap below filters → order list */}
      <div className="mt-6">
        {ordersData.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card px-6 py-12 text-center">
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
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-2xl border bg-card px-6 py-12 text-center">
            <p className="font-medium text-foreground">No orders in this filter</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another status tab to see matching orders.
            </p>
          </div>
        ) : (
          <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {/* Column headers — same grid + padding as rows */}
            <div
              className={cn(
                "hidden border-b bg-muted/40 px-5 py-3.5 lg:px-6",
                ORDER_GRID
              )}
            >
              <div className="pl-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Order details
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Department
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Value &amp; date
              </div>
              <div className="text-right text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                Status
              </div>
            </div>

            <ul className="divide-y">
              {filteredOrders.map((order) => {
                const expanded = expandedId === order.id;
                return (
                  <li key={order.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : order.id)}
                      className="relative w-full px-5 py-5 text-left transition-colors hover:bg-muted/25 focus-visible:bg-muted/25 focus-visible:outline-none lg:px-6"
                      aria-expanded={expanded}
                    >
                      <span
                        className={cn(
                          "absolute inset-y-4 left-0 w-[3px] rounded-r-full",
                          statusAccent(order.status)
                        )}
                        aria-hidden="true"
                      />

                      {/* Mobile */}
                      <div className="space-y-3.5 md:hidden">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                            <Package
                              className="size-4 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-snug text-foreground">
                              {order.bidTitle}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">{order.id}</p>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.department}</p>
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="font-semibold tabular-nums text-foreground">
                              {formatCurrency(order.totalValue)}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatDate(order.orderDate)}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <span className={statusBadge(order.status)}>
                              {statusLabel(order.status)}
                            </span>
                            <span className={cn(paymentBadge(order.paymentStatus), "gap-1")}>
                              {paymentLabel(order.paymentStatus)}
                              <ChevronDown
                                className={cn(
                                  "size-3 transition-transform",
                                  expanded && "rotate-180"
                                )}
                                aria-hidden="true"
                              />
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Desktop */}
                      <div className={cn("hidden", ORDER_GRID)}>
                        <div className="flex min-w-0 items-center gap-3 pl-1">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                            <Package
                              className="size-4 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">
                              {order.bidTitle}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{order.id}</p>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm text-muted-foreground">
                            {order.department}
                          </p>
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold tabular-nums text-foreground">
                            {formatCurrency(order.totalValue)}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDate(order.orderDate)}
                          </p>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                          <span className={cn(statusBadge(order.status), "whitespace-nowrap")}>
                            {statusLabel(order.status)}
                          </span>
                          <span
                            className={cn(
                              paymentBadge(order.paymentStatus),
                              "gap-1 whitespace-nowrap"
                            )}
                          >
                            {paymentLabel(order.paymentStatus)}
                            <ChevronDown
                              className={cn(
                                "size-3 transition-transform",
                                expanded && "rotate-180"
                              )}
                              aria-hidden="true"
                            />
                          </span>
                        </div>
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t bg-muted/20 px-5 py-5 lg:px-6">
                        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                          Delivery timeline
                        </p>
                        <ol className="relative ml-1.5 border-l-2 border-border">
                          {getTimeline(order).map((step) => (
                            <li
                              key={step.label}
                              className="relative flex gap-3 pb-4 pl-5 last:pb-0"
                            >
                              <span className="absolute -left-[9px] top-0.5 bg-[hsl(var(--card))]">
                                {step.done ? (
                                  <CheckCircle2
                                    className="size-4 text-emerald-500"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <Circle
                                    className="size-4 text-muted-foreground/40"
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                              <div>
                                <p
                                  className={cn(
                                    "text-sm",
                                    step.done
                                      ? "font-medium text-foreground"
                                      : "text-muted-foreground"
                                  )}
                                >
                                  {step.label}
                                </p>
                                {step.date && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {formatDate(step.date)}
                                  </p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </PageShell>
  );
}

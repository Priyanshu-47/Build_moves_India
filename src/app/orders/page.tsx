"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Package } from "lucide-react";

import ordersData from "@/data/orders.json";
import { PageShell } from "@/components/PageShell";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Order = (typeof ordersData)[number];

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

function statusVariant(status: Order["status"]): "default" | "secondary" | "outline" {
  switch (status) {
    case "delivered":
      return "default";
    case "in_transit":
      return "secondary";
    default:
      return "outline";
  }
}

function paymentLabel(status: Order["paymentStatus"]): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "pending":
      return "Payment Pending";
    default:
      return "Not Due";
  }
}

function getPaymentExpectedDate(order: Order): string {
  if (order.paymentDate) return formatDate(order.paymentDate);
  const delivery = new Date(order.deliveryDate);
  delivery.setDate(delivery.getDate() + 15);
  return formatDate(delivery.toISOString().slice(0, 10));
}

function getTimeline(order: Order) {
  const steps = [
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
  return steps;
}

export default function OrdersPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const summary = useMemo(() => {
    const totalRevenue = ordersData.reduce((sum, order) => sum + order.totalValue, 0);
    const pendingPayments = ordersData.filter(
      (order) => order.paymentStatus === "pending"
    ).length;
    return {
      totalOrders: ordersData.length,
      totalRevenue,
      pendingPayments,
    };
  }, []);

  return (
    <PageShell>
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Order Tracker</h1>
        <p className="text-sm text-muted-foreground">
          Track deliveries, CRAC, and payments for your GeM orders.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total orders</CardDescription>
            <CardTitle className="text-2xl">{summary.totalOrders}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total revenue</CardDescription>
            <CardTitle className="text-2xl">
              {formatCurrency(summary.totalRevenue)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Pending payments</CardDescription>
            <CardTitle className="text-2xl">{summary.pendingPayments}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-3">
        {ordersData.map((order) => {
          const expanded = expandedId === order.id;
          return (
            <Card key={order.id}>
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setExpandedId(expanded ? null : order.id)}
                aria-expanded={expanded}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-base leading-snug break-words">
                          {order.bidTitle}
                        </CardTitle>
                        <Badge variant={statusVariant(order.status)}>
                          {statusLabel(order.status)}
                        </Badge>
                      </div>
                      <CardDescription>{order.department}</CardDescription>
                    </div>
                    <ChevronDown
                      className={cn(
                        "size-5 shrink-0 text-muted-foreground transition-transform",
                        expanded && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-muted-foreground">Qty:</span>{" "}
                    {order.quantity} × {formatCurrency(order.unitPrice)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Value:</span>{" "}
                    <strong>{formatCurrency(order.totalValue)}</strong>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Ordered:</span>{" "}
                    {formatDate(order.orderDate)}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Delivery:</span>{" "}
                    {formatDate(order.deliveryDate)}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-muted-foreground">Payment:</span>{" "}
                    {paymentLabel(order.paymentStatus)}
                  </p>
                </CardContent>
              </button>

              {expanded && (
                <CardContent className="border-t pt-4">
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-medium">Delivery timeline</p>
                      <ol className="space-y-2">
                        {getTimeline(order).map((step) => (
                          <li key={step.label} className="flex items-center gap-2 text-sm">
                            <Package
                              className={cn(
                                "size-4 shrink-0",
                                step.done ? "text-green-600" : "text-muted-foreground"
                              )}
                              aria-hidden="true"
                            />
                            <span className={step.done ? "" : "text-muted-foreground"}>
                              {step.label}
                              {step.date ? ` — ${formatDate(step.date)}` : ""}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="grid gap-2 text-sm sm:grid-cols-2">
                      <p>
                        <span className="text-muted-foreground">CRAC status:</span>{" "}
                        {order.cracGenerated ? "Generated ✓" : "Pending — upload after delivery"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Payment expected:</span>{" "}
                        {getPaymentExpectedDate(order)}
                      </p>
                      {order.rating !== null && (
                        <p>
                          <span className="text-muted-foreground">Buyer rating:</span>{" "}
                          {order.rating}/5
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}

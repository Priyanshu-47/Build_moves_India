"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";

import paymentsData from "@/data/payments.json";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaymentOrder } from "@/lib/schemas";
import {
  calculateGSTLiability,
  formatGSTDate,
  getPaymentTimeline,
} from "@/lib/rules/gst-planner";

const orders = paymentsData as PaymentOrder[];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function GSTPlanner() {
  const orderGst = useMemo(
    () =>
      orders.map((order) => ({
        order,
        liability: calculateGSTLiability(order),
        timeline: getPaymentTimeline(order),
      })),
    []
  );

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
        <AlertTriangle className="mb-1 inline size-4" aria-hidden="true" />{" "}
        <strong>GST must be paid by the 20th of the next month</strong> regardless of whether
        the government buyer has paid you yet.
      </div>

      <div className="space-y-3">
        {orderGst.map(({ order, liability, timeline }) => (
          <Card key={order.id} size="sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base leading-snug">{order.bidTitle}</CardTitle>
              <CardDescription>
                GST {formatCurrency(liability.total)} · due {formatGSTDate(liability.dueDate)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid gap-1 sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Taxable value:</span>{" "}
                  {formatCurrency(liability.taxableValue)}
                </p>
                <p>
                  <span className="text-muted-foreground">CGST + SGST:</span>{" "}
                  {formatCurrency(liability.cgst)} + {formatCurrency(liability.sgst)}
                </p>
                <p>
                  <span className="text-muted-foreground">Delivery:</span>{" "}
                  {formatGSTDate(timeline.deliveryDate)}
                </p>
                <p>
                  <span className="text-muted-foreground">Payment status:</span>{" "}
                  {order.status === "paid" ? "Received" : "Pending"}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{timeline.gapDescription}</p>
              {timeline.gstDue && timeline.paymentReceived && (
                <p className="text-xs">
                  Timeline: Invoice → GST due {formatGSTDate(timeline.gstDue)} → Payment{" "}
                  {formatGSTDate(timeline.paymentReceived)}
                </p>
              )}
              {timeline.gstDue && !timeline.paymentReceived && (
                <p className="text-xs text-destructive">
                  GST due {formatGSTDate(timeline.gstDue)} — payment not yet received (
                  {formatCurrency(order.totalValue)} pending)
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

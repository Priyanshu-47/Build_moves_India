import { PaymentOrder } from "@/lib/schemas";

export const GST_RATE = 0.18;
export const CGST_RATE = 0.09;
export const SGST_RATE = 0.09;

export type GSTLiability = {
  taxableValue: number;
  cgst: number;
  sgst: number;
  total: number;
  dueDate: string;
};

export type GSTPaymentTimeline = {
  deliveryDate: string;
  invoiceDate: string | null;
  paymentReceived: string | null;
  gstDue: string | null;
  gap: number;
  gapDescription: string;
};

export type CashGapResult = {
  totalGSTDue: number;
  cashAvailable: number;
  gap: number;
  riskLevel: "low" | "medium" | "high";
  message: string;
};

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function formatDueDate(invoiceDate: string): string {
  const date = parseDate(invoiceDate);
  const due = new Date(date.getFullYear(), date.getMonth() + 1, 20);
  return due.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string): number {
  const start = parseDate(from);
  const end = parseDate(to);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function calculateGSTLiability(order: PaymentOrder): GSTLiability {
  const taxableValue = order.totalValue;
  const cgst = Math.round(taxableValue * CGST_RATE);
  const sgst = Math.round(taxableValue * SGST_RATE);
  const total = cgst + sgst;
  const invoiceDate = order.invoiceDate ?? order.deliveryDate;

  return {
    taxableValue,
    cgst,
    sgst,
    total,
    dueDate: formatDueDate(invoiceDate),
  };
}

export function getPaymentTimeline(order: PaymentOrder): GSTPaymentTimeline {
  const liability = calculateGSTLiability(order);
  const invoiceDate = order.invoiceDate;
  const paymentReceived = order.paymentDate;
  const gstDue = invoiceDate ? liability.dueDate : null;

  let gap = 0;
  let gapDescription = "GST not yet due — invoice not generated.";

  if (gstDue && !paymentReceived) {
    gap = daysBetween(gstDue, order.deliveryDate);
    gapDescription =
      gap > 0
        ? `GST was due ${gap} days before payment received — cash flow risk.`
        : "GST due date aligns with expected payment window.";
  } else if (gstDue && paymentReceived) {
    const paymentGap = daysBetween(gstDue, paymentReceived);
    gap = paymentGap;
    gapDescription =
      paymentGap > 0
        ? `Payment arrived ${paymentGap} days after GST due date.`
        : "Payment received before GST due — healthy cash flow.";
  }

  return {
    deliveryDate: order.deliveryDate,
    invoiceDate,
    paymentReceived,
    gstDue,
    gap,
    gapDescription,
  };
}

export function checkCashGap(
  orders: PaymentOrder[],
  cashAvailable = 50_000
): CashGapResult {
  let totalGSTDue = 0;
  let pendingPayment = 0;

  for (const order of orders) {
    if (!order.invoiceDate) continue;
    const liability = calculateGSTLiability(order);
    if (order.status !== "paid") {
      totalGSTDue += liability.total;
      pendingPayment += order.totalValue;
    }
  }

  const gap = Math.max(0, totalGSTDue - cashAvailable);

  let riskLevel: CashGapResult["riskLevel"];
  if (gap <= 0) {
    riskLevel = "low";
  } else if (gap <= 50_000) {
    riskLevel = "medium";
  } else {
    riskLevel = "high";
  }

  let message: string;
  if (gap <= 0) {
    message = "Cash reserves cover upcoming GST liability.";
  } else {
    const largestPending = orders
      .filter((order) => order.status !== "paid" && order.invoiceDate)
      .sort((a, b) => b.totalValue - a.totalValue)[0];
    const paymentHint = largestPending
      ? formatCurrency(largestPending.totalValue)
      : formatCurrency(pendingPayment);
    message = `You need ${formatCurrency(gap + cashAvailable)} for GST before ${paymentHint} payment arrives. Set aside ${formatCurrency(gap)} more.`;
  }

  return { totalGSTDue, cashAvailable, gap, riskLevel, message };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatGSTDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

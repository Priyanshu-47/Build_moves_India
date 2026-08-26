import { PaymentOrder } from "@/lib/schemas";

/** RBI notified rate (~3.05%). MSMED Act penalty = 3× this rate. */
export const RBI_NOTIFIED_RATE = 0.0305;
export const PENALTY_RATE_ANNUAL = RBI_NOTIFIED_RATE * 3; // ~9.15%
export const MSMED_PAYMENT_PERIOD_DAYS = 45;

/** Reference "today" for consistent mock day calculations in the prototype. */
export const REFERENCE_TODAY = "2026-08-26";

export type PaymentRightsResult = {
  eligible: boolean;
  rights: string[];
  interestAmount: number;
  daysSinceDelivery: number;
  daysSinceAcceptance: number;
  daysOverdue: number;
};

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

export function daysBetween(from: string, to: string = REFERENCE_TODAY): number {
  const start = parseDate(from);
  const end = parseDate(to);
  return Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
}

/**
 * Compound interest at 3× RBI notified rate, compounded monthly (MSMED Act Sec 16).
 * @param amount Invoice / order value in INR
 * @param daysOverdue Days past the 45-day payment window
 */
export function calculateInterest(amount: number, daysOverdue: number): number {
  if (daysOverdue <= 0) return 0;
  const monthlyRate = PENALTY_RATE_ANNUAL / 12;
  const months = daysOverdue / 30;
  return Math.round(amount * (Math.pow(1 + monthlyRate, months) - 1));
}

export function getAcceptanceDate(order: PaymentOrder): string {
  return order.cracDate ?? order.deliveryDate;
}

export function getDaysOverdue(order: PaymentOrder): number {
  if (order.status === "paid") return 0;
  if (!order.cracGenerated) return 0;
  const daysSinceAcceptance = daysBetween(getAcceptanceDate(order));
  return Math.max(0, daysSinceAcceptance - MSMED_PAYMENT_PERIOD_DAYS);
}

export function checkPaymentRights(order: PaymentOrder): PaymentRightsResult {
  const daysSinceDelivery = daysBetween(order.deliveryDate);
  const daysSinceAcceptance = order.cracGenerated
    ? daysBetween(getAcceptanceDate(order))
    : 0;
  const daysOverdue = getDaysOverdue(order);
  const interestAmount = calculateInterest(order.totalValue, daysOverdue);

  const rights: string[] = [];

  if (!order.cracGenerated && order.status !== "paid") {
    rights.push(
      "CRAC not generated — payment clock has not started. Follow up with consignee immediately."
    );
    rights.push(
      "Without CRAC, buyer has no acceptance record and payment may be indefinitely delayed."
    );
  }

  if (order.cracGenerated && daysSinceAcceptance > MSMED_PAYMENT_PERIOD_DAYS) {
    rights.push(
      `Payment overdue by ${daysOverdue} days — MSMED Act Sec 16 interest applies (3× RBI rate, ~${(PENALTY_RATE_ANNUAL * 100).toFixed(2)}% p.a., compounded monthly).`
    );
    rights.push(
      "Buyer must pay within 45 days of goods/services acceptance — you are legally entitled to compound interest."
    );
    rights.push(
      `Estimated interest due: ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(interestAmount)}`
    );
  }

  if (order.cracGenerated && daysSinceAcceptance <= MSMED_PAYMENT_PERIOD_DAYS) {
    rights.push(
      `Payment due within ${MSMED_PAYMENT_PERIOD_DAYS - daysSinceAcceptance} days of acceptance — monitor closely.`
    );
  }

  const eligible =
    order.status === "overdue" ||
    (order.status === "stuck" && daysSinceDelivery >= 15) ||
    daysOverdue > 0;

  return {
    eligible,
    rights,
    interestAmount,
    daysSinceDelivery,
    daysSinceAcceptance,
    daysOverdue,
  };
}

export function getEscalationSteps(_order: PaymentOrder): string[] {
  return [
    "Follow up with consignee",
    "Raise GeM incident",
    "File CPGRAMS",
    "File MSME ODR",
  ];
}

export type InterestBreakdown = {
  principal: number;
  daysOverdue: number;
  monthlyRate: number;
  months: number;
  annualRate: number;
  rbiRate: number;
  interest: number;
};

export function getInterestBreakdown(
  amount: number,
  daysOverdue: number
): InterestBreakdown {
  const monthlyRate = PENALTY_RATE_ANNUAL / 12;
  const months = daysOverdue / 30;
  return {
    principal: amount,
    daysOverdue,
    monthlyRate,
    months,
    annualRate: PENALTY_RATE_ANNUAL,
    rbiRate: RBI_NOTIFIED_RATE,
    interest: calculateInterest(amount, daysOverdue),
  };
}

export function getMsmeOdrSteps(): string[] {
  return [
    "Visit samadhaan.msme.gov.in (MSME Samadhaan / ODR portal).",
    "Register using your Udyam Registration Number and business details.",
    "Select \"File a complaint\" and enter buyer department, order/invoice details.",
    "Upload proof: invoice, CRAC, delivery challan, and payment follow-up records.",
    "Portal assigns case to facilitation council — mediation within 90 days.",
    "If unresolved, case proceeds to arbitration under MSMED Act.",
  ];
}

export type UdyamCategory = "micro" | "small" | "not_eligible";

export function classifyUdyamInvestment(investmentCr: number): UdyamCategory {
  if (investmentCr <= 2.5) return "micro";
  if (investmentCr <= 25) return "small";
  return "not_eligible";
}

import { PaymentOrder } from "@/lib/schemas";
import {
  MSMED_PAYMENT_PERIOD_DAYS,
  getDaysOverdue,
  getInterestBreakdown,
} from "@/lib/rules/msme-rights";

export function buildLegalNotice(order: PaymentOrder): string {
  const daysOverdue = getDaysOverdue(order);
  const breakdown = getInterestBreakdown(order.totalValue, daysOverdue);

  return `LEGAL NOTICE FOR DELAYED PAYMENT
(Under Section 15 & 16, MSMED Act, 2006)

Date: 26 August 2026

To,
The Accounts Officer / Consignee
${order.department}
Government of India

From,
[MSE Seller Name]
[Business Address]
Udyam Reg. No.: [URN]
GSTIN: [GSTIN]

Subject: Demand for payment of outstanding invoice and compound interest under MSMED Act

Dear Sir/Madam,

We refer to GeM order for "${order.bidTitle}" (Order ID: ${order.id}).

1. Goods were delivered on ${order.deliveryDate} and accepted (CRAC generated on ${order.cracDate ?? "N/A"}).
2. Invoice amount of ₹${order.totalValue.toLocaleString("en-IN")} remains unpaid beyond the statutory ${MSMED_PAYMENT_PERIOD_DAYS}-day period from date of acceptance.
3. Under Section 16 of the MSMED Act, 2006, you are liable to pay compound interest at three times the bank rate notified by the RBI (currently ~${(breakdown.annualRate * 100).toFixed(2)}% p.a., compounded monthly) for the period of delay.
4. Estimated interest accrued: ₹${breakdown.interest.toLocaleString("en-IN")} (calculated for ${breakdown.daysOverdue} days overdue).

We hereby demand:
(a) Immediate payment of the principal amount of ₹${order.totalValue.toLocaleString("en-IN")};
(b) Payment of compound interest of ₹${breakdown.interest.toLocaleString("en-IN")} as per Section 16;
(c) Written confirmation of payment timeline within 7 days of receipt of this notice.

Failing which, we reserve the right to file a complaint on the MSME Samadhaan (ODR) portal and pursue all remedies available under law.

Yours faithfully,
[Authorized Signatory]
[MSE Business Name]

---
This is a template for demonstration only. Consult a legal professional before sending.`;
}

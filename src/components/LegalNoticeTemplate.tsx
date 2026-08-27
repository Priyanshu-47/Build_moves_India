"use client";

import { useMemo, useState } from "react";
import { Copy, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationPanel } from "@/components/ui/confirmation-panel";
import paymentsData from "@/data/payments.json";
import { PaymentOrder } from "@/lib/schemas";
import { buildLegalNotice } from "@/lib/rules/legal-notice";
import {
  calculateInterest,
  getDaysOverdue,
} from "@/lib/rules/msme-rights";

const overdueOrder = (paymentsData as PaymentOrder[]).find(
  (order) => order.status === "overdue"
);

const SAMPLE_NOTICE = overdueOrder
  ? buildLegalNotice(overdueOrder)
  : `LEGAL NOTICE FOR DELAYED PAYMENT
(Under Section 15 & 16, MSMED Act, 2006)

[Template — replace bracketed fields with your details]

Subject: Demand for payment of outstanding invoice and compound interest under MSMED Act

Dear Sir/Madam,

We refer to our supply of goods/services against your GeM order. Payment remains outstanding beyond the statutory 45-day period from date of acceptance.

Under Section 16 of the MSMED Act, 2006, you are liable to pay compound interest at three times the bank rate notified by the RBI, compounded monthly.

We demand immediate payment of principal and accrued interest within 7 days.

Yours faithfully,
[Authorized Signatory]`;

const MSME_ODR_URL = "https://samadhaan.msme.gov.in/";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function downloadNotice(noticeText: string) {
  const blob = new Blob([noticeText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "msmed-delayed-payment-notice.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function LegalNoticeTemplate() {
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  const noticeSummary = useMemo(() => {
    if (!overdueOrder) return null;
    const daysOverdue = getDaysOverdue(overdueOrder);
    const interestAmount = calculateInterest(overdueOrder.totalValue, daysOverdue);
    return {
      orderValue: formatCurrency(overdueOrder.totalValue),
      daysOverdue: String(daysOverdue),
      interestAmount: formatCurrency(interestAmount),
    };
  }, []);

  async function handleCopy() {
    await navigator.clipboard.writeText(SAMPLE_NOTICE);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (generated && noticeSummary) {
    return (
      <ConfirmationPanel
        title="Legal notice generated"
        summary={[
          { label: "Order value", value: noticeSummary.orderValue },
          { label: "Days overdue", value: noticeSummary.daysOverdue },
          { label: "Interest amount", value: noticeSummary.interestAmount },
        ]}
        whatNext={["Send via registered post", "File on MSME ODR portal"]}
        actions={[
          {
            label: "Download notice",
            onClick: () => downloadNotice(SAMPLE_NOTICE),
          },
          {
            label: "File on ODR",
            action: MSME_ODR_URL,
            external: true,
            variant: "outline",
          },
        ]}
      />
    );
  }

  return (
    <div className="space-y-3 print-content print-expand">
      <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed whitespace-pre-wrap">
        {SAMPLE_NOTICE}
      </pre>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={() => setGenerated(true)}>
          Generate notice
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => downloadNotice(SAMPLE_NOTICE)}>
          <Download className="size-4" aria-hidden="true" />
          Download as .txt
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          <Copy className="size-4" aria-hidden="true" />
          {copied ? "Copied!" : "Copy to clipboard"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Template pre-filled with mock order data for demonstration. Consult a legal professional
        before sending.
      </p>
    </div>
  );
}

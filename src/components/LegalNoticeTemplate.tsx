"use client";

import { useState } from "react";
import { Copy, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import paymentsData from "@/data/payments.json";
import { PaymentOrder } from "@/lib/schemas";
import { buildLegalNotice } from "@/lib/rules/legal-notice";

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

export function LegalNoticeTemplate() {
  const [copied, setCopied] = useState(false);

  function handleDownload() {
    const blob = new Blob([SAMPLE_NOTICE], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "msmed-delayed-payment-notice.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(SAMPLE_NOTICE);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-3">
      <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/40 p-4 text-xs leading-relaxed whitespace-pre-wrap">
        {SAMPLE_NOTICE}
      </pre>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleDownload}>
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

"use client";

import { useState } from "react";
import { AlertTriangle, Calculator, Download, Gavel } from "lucide-react";
import Link from "next/link";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { PaymentOrder } from "@/lib/schemas";
import {
  MSMED_PAYMENT_PERIOD_DAYS,
  checkPaymentRights,
  getInterestBreakdown,
  getMsmeOdrSteps,
} from "@/lib/rules/msme-rights";
import { SOURCE_MSMED_RBI } from "@/lib/sources";

type PaymentAlertProps = {
  order: PaymentOrder;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function PaymentAlert({ order }: PaymentAlertProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showClaim, setShowClaim] = useState(false);

  const rights = checkPaymentRights(order);
  const breakdown = getInterestBreakdown(order.totalValue, rights.daysOverdue);
  const odrSteps = getMsmeOdrSteps();

  if (order.status !== "overdue" || rights.daysOverdue <= 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" aria-hidden="true" />
      <AlertTitle>
        {formatCurrency(rights.interestAmount)} interest accrued — you&apos;re legally entitled
        to this
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Payment is {rights.daysOverdue} days past the {MSMED_PAYMENT_PERIOD_DAYS}-day MSMED Act
          window. Compound interest at 3× RBI rate continues to accrue until paid.
        </p>
        <p className="text-xs text-muted-foreground">{SOURCE_MSMED_RBI}</p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 border-destructive/30 bg-background"
            onClick={() => {
              setShowBreakdown((value) => !value);
              setShowClaim(false);
            }}
          >
            <Calculator className="size-4" aria-hidden="true" />
            Calculate interest
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 border-destructive/30 bg-background"
            onClick={() => {
              setShowClaim((value) => !value);
              setShowBreakdown(false);
            }}
          >
            <Gavel className="size-4" aria-hidden="true" />
            File claim
          </Button>
          <Link
            href="/msme-rights"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-8 border-destructive/30 bg-background",
            })}
          >
            Know your rights
          </Link>
        </div>

        {showBreakdown && (
          <div className="rounded-lg border border-destructive/20 bg-background/80 p-3 text-sm text-foreground">
            <p className="mb-2 font-medium">Interest breakdown (Section 16, MSMED Act)</p>
            <div className="space-y-1 font-mono text-xs">
              <p>Principal (invoice value) = {formatCurrency(breakdown.principal)}</p>
              <p>RBI notified rate = {(breakdown.rbiRate * 100).toFixed(2)}% p.a.</p>
              <p>Penalty rate (3× RBI) = {(breakdown.annualRate * 100).toFixed(2)}% p.a.</p>
              <p>Monthly rate (r) = {(breakdown.monthlyRate * 100).toFixed(4)}%</p>
              <p>Days overdue = {breakdown.daysOverdue}</p>
              <p>Months (days ÷ 30) = {breakdown.months.toFixed(2)}</p>
            </div>
            <p className="mt-2 rounded bg-muted px-2 py-1.5 font-mono text-xs">
              Interest = P × [(1 + r)<sup>n</sup> − 1] ={" "}
              {formatCurrency(breakdown.principal)} × [(1 +{" "}
              {breakdown.monthlyRate.toFixed(6)})<sup>{breakdown.months.toFixed(2)}</sup> − 1] ={" "}
              <strong>{formatCurrency(breakdown.interest)}</strong>
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{SOURCE_MSMED_RBI}</p>
          </div>
        )}

        {showClaim && (
          <div className="rounded-lg border border-destructive/20 bg-background/80 p-3 text-sm text-foreground">
            <p className="mb-2 font-medium">File on MSME ODR portal (Samadhaan)</p>
            <ol className="space-y-2">
              {odrSteps.map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
            <a
              href="https://samadhaan.msme.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium hover:bg-muted"
            >
              Open MSME Samadhaan
              <Download className="size-3.5" aria-hidden="true" />
            </a>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

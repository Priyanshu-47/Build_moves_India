"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Plus,
  Scale,
} from "lucide-react";

import { LegalNoticeTemplate } from "@/components/LegalNoticeTemplate";
import { PageShell } from "@/components/PageShell";
import {
  MSMED_PAYMENT_PERIOD_DAYS,
  PENALTY_RATE_ANNUAL,
  RBI_NOTIFIED_RATE,
  calculateInterest,
} from "@/lib/rules/msme-rights";
import { SOURCE_MSMED_RBI } from "@/lib/sources";
const EXAMPLE_INVOICE = 420_000;
const EXAMPLE_DAYS_OVERDUE = 32;
const EXAMPLE_INTEREST = calculateInterest(EXAMPLE_INVOICE, EXAMPLE_DAYS_OVERDUE);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

type RightItem = {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  bullets: string[];
  claimUrl?: string;
  claimLabel?: string;
  internal?: boolean;
  showFormula?: boolean;
};

const RIGHTS: RightItem[] = [
  {
    id: "delayed-payment",
    number: 1,
    title: "Delayed Payment Interest",
    subtitle: "Section 16, MSMED Act, 2006",
    summary:
      "If the buyer doesn't pay within 45 days of accepting goods or services, you are legally entitled to compound interest at 3× the RBI bank rate, compounded monthly.",
    bullets: [
      "Automatically applicable above 45 days from deemed acceptance",
      "Calculated monthly on the outstanding amount till payment",
      "No need to prove loss — interest is your legal right under the Act",
      "File online on the MSME Samadhaan Portal (simple 10-minute process)",
    ],
    claimUrl: "https://samadhaan.msme.gov.in/",
    claimLabel: "File on MSME Samadhaan",
    showFormula: true,
  },
  {
    id: "emd-exemption",
    number: 2,
    title: "EMD Exemption",
    subtitle: "Government Circulars",
    summary:
      "Registered MSE sellers on GeM are exempt from depositing Earnest Money (EMD) when bidding — a major cash-flow advantage over non-MSE competitors.",
    bullets: [
      "Requires valid Udyam registration linked to your GeM seller profile",
      "Savings per bid: typically ₹5,000–₹50,000 depending on tender value",
      "EMD is usually 1–3% of estimated bid value — blocked until evaluation",
      "Without Udyam linkage, you must pay EMD like any large corporate bidder",
    ],
    claimUrl: "/udyam",
    claimLabel: "Register on Udyam first",
    internal: true,
  },
  {
    id: "price-preference",
    number: 3,
    title: "Price Preference",
    subtitle: "Public Procurement Policy",
    summary:
      "If L1 is a non-MSE, you can match the L1 price if your quote is within L1+15% — and receive up to 25% of the order under MSE reservation.",
    bullets: [
      "25% of government procurement on GeM is reserved for MSEs",
      "Price preference applies only when you meet technical eligibility",
      "Ensure Udyam status is active and product category matches specs",
    ],
  },
  {
    id: "treds",
    number: 4,
    title: "TDS / Invoice Discounting",
    subtitle: "Cash flow protection",
    summary:
      "Upload your invoice on TReDS → receive up to 95% of invoice value within ~3 days, instead of waiting 30–45 days for government payment.",
    bullets: [
      "Platforms: M1xchange, RXIL, Invoicemart (RBI-approved)",
      "Buyer department must be registered on the TReDS platform",
      "Useful when CRAC is generated but payment is delayed",
    ],
    claimUrl: "https://www.treds.in/",
    claimLabel: "Learn about TReDS",
  },
  {
    id: "cpgrams",
    number: 5,
    title: "CPGRAMS Escalation",
    subtitle: "Grievance redressal escalation system",
    summary:
      "If consignee follow-up, GeM incidents, and MSME ODR don't resolve the issue — file a formal grievance on pgportal.gov.in.",
    bullets: [
      "Attach order copy, invoice, CRAC, delivery proof, and correspondence",
      "Select the correct ministry/department and grievance category",
      "Tracking ID assigned — escalate if not resolved in 30 days",
    ],
    claimUrl: "https://pgportal.gov.in/",
    claimLabel: "File on CPGRAMS",
  },
];

function RightAccordion({
  right,
  open,
  onToggle,
}: {
  right: RightItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      id={right.id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card shadow-sm transition"
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
        aria-expanded={open}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {right.number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{right.title}</p>
          <p className="text-xs text-muted-foreground">{right.subtitle}</p>
        </div>
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div className="border-t px-4 pb-5 pt-4 sm:px-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{right.summary}</p>

          <ul className="mt-4 space-y-2">
            {right.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {bullet}
              </li>
            ))}
          </ul>

          {right.showFormula && (
            <div className="mt-4 rounded-xl border bg-muted/30 p-4">
              <p className="mb-3 text-xs font-bold text-foreground">
                Interest calculation example
              </p>
              <dl className="grid gap-1.5 text-xs sm:grid-cols-2">
                <div className="flex justify-between gap-3 sm:col-span-2">
                  <dt className="text-muted-foreground">Invoice Value</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatCurrency(EXAMPLE_INVOICE)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Due Date</dt>
                  <dd className="font-medium">15 Sept 2026</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Days Overdue</dt>
                  <dd className="font-semibold tabular-nums">{EXAMPLE_DAYS_OVERDUE}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">RBI Bank Rate</dt>
                  <dd className="font-medium tabular-nums">
                    {(RBI_NOTIFIED_RATE * 100).toFixed(2)}%
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Interest Rate (3×)</dt>
                  <dd className="font-medium tabular-nums">
                    {(PENALTY_RATE_ANNUAL * 100).toFixed(2)}% p.a.
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Interest Amount</dt>
                  <dd className="font-bold tabular-nums text-primary">
                    {formatCurrency(EXAMPLE_INTEREST)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-t pt-1.5 sm:col-span-2">
                  <dt className="font-semibold text-foreground">Total Payable</dt>
                  <dd className="font-extrabold tabular-nums">
                    {formatCurrency(EXAMPLE_INVOICE + EXAMPLE_INTEREST)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] text-muted-foreground">{SOURCE_MSMED_RBI}</p>
            </div>
          )}

          {right.claimUrl && (
            <div className="mt-4">
              {right.internal ? (
                <Link
                  href={right.claimUrl}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-4 text-xs font-semibold transition hover:bg-muted"
                >
                  {right.claimLabel}
                </Link>
              ) : (
                <a
                  href={right.claimUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border bg-background px-4 text-xs font-semibold transition hover:bg-muted"
                >
                  {right.claimLabel}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MsmeRightsPage() {
  const [openId, setOpenId] = useState<string>("delayed-payment");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    if (RIGHTS.some((right) => right.id === hash)) {
      setOpenId(hash);
      queueMicrotask(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    if (hash === "legal-notice") {
      queueMicrotask(() => {
        document.getElementById("legal-notice")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, []);

  return (
    <PageShell className="pb-10">
      <Link
        href="/payments"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3" aria-hidden="true" />
        Back to payments
      </Link>

      <header className="mt-4 space-y-2">
        <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
          <Scale className="size-3.5" aria-hidden="true" />
          Legal notice guide
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Five legal protections that save lakhs
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Modern businesses lose lakhs every year due to MSMED Act gaps you can avoid.
        </p>
      </header>

      <div className="mt-6 space-y-3">
        {RIGHTS.map((right) => (
          <RightAccordion
            key={right.id}
            right={right}
            open={openId === right.id}
            onToggle={() => setOpenId((current) => (current === right.id ? "" : right.id))}
          />
        ))}
      </div>

      <section
        id="legal-notice"
        className="mt-6 scroll-mt-24 rounded-2xl border bg-card p-5 shadow-sm sm:p-6"
      >
        <div className="mb-1 flex items-center gap-2">
          <FileText className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">
            Legal notice template — delayed payment
          </h2>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Use this ready template under Section 16, MSMED Act for delays in payment beyond{" "}
          {MSMED_PAYMENT_PERIOD_DAYS} days.
        </p>
        <LegalNoticeTemplate />
      </section>

      <div className="mt-6">
        <Link
          href="/payments"
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          Check your payments
        </Link>
      </div>
    </PageShell>
  );
}

import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  ExternalLink,
  FileText,
  Gavel,
  IndianRupee,
  Scale,
  Shield,
  TrendingUp,
} from "lucide-react";

import { Disclaimer } from "@/components/Disclaimer";
import { LegalNoticeTemplate } from "@/components/LegalNoticeTemplate";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MSMED_PAYMENT_PERIOD_DAYS,
  PENALTY_RATE_ANNUAL,
  RBI_NOTIFIED_RATE,
  calculateInterest,
} from "@/lib/rules/msme-rights";
import { SOURCE_BUSINESS_STANDARD, SOURCE_MSMED_RBI } from "@/lib/sources";

const EXAMPLE_PRINCIPAL = 912_000;
const EXAMPLE_DAYS_OVERDUE = 55;
const EXAMPLE_INTEREST = calculateInterest(EXAMPLE_PRINCIPAL, EXAMPLE_DAYS_OVERDUE);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const RIGHTS = [
  {
    id: "delayed-payment",
    number: 1,
    title: "Delayed Payment Interest",
    subtitle: "Section 16, MSMED Act, 2006",
    icon: Scale,
    summary:
      "If the buyer doesn't pay within 45 days of accepting goods or services, you are legally entitled to compound interest at 3× the RBI bank rate, compounded monthly.",
    details: [
      `Statutory payment period: ${MSMED_PAYMENT_PERIOD_DAYS} days from acceptance (CRAC on GeM).`,
      `Current RBI notified rate: ~${(RBI_NOTIFIED_RATE * 100).toFixed(2)}% → penalty rate: ~${(PENALTY_RATE_ANNUAL * 100).toFixed(2)}% p.a.`,
      "Interest accrues until full payment of principal + interest is received.",
      "File complaint on MSME Samadhaan (ODR) portal if buyer does not pay after notice.",
    ],
    formula: true,
    claimUrl: "https://samadhaan.msme.gov.in/",
    claimLabel: "File on MSME ODR portal",
  },
  {
    id: "emd-exemption",
    number: 2,
    title: "EMD Exemption",
    subtitle: "GeM MSE policy",
    icon: Shield,
    summary:
      "Registered MSE sellers on GeM are exempt from depositing Earnest Money (EMD) when bidding — a major cash-flow advantage over non-MSE competitors.",
    details: [
      "Requires valid Udyam registration linked to your GeM seller profile.",
      "Savings per bid: typically ₹5,000–₹50,000 depending on tender value.",
      "EMD is usually 1–3% of estimated bid value — blocked until bid evaluation completes.",
      "Without Udyam linkage, you must pay EMD like any large corporate bidder.",
    ],
    formula: false,
    claimUrl: "/udyam",
    claimLabel: "Register on Udyam first",
    internal: true,
  },
  {
    id: "price-preference",
    number: 3,
    title: "Price Preference",
    subtitle: "GeM procurement norms",
    icon: TrendingUp,
    summary:
      "If L1 (lowest bidder) is a non-MSE, you can match the L1 price if your quote is within L1+15% — and receive up to 25% of the order value under MSE reservation.",
    details: [
      "Example: L1 quotes ₹10L (non-MSE). Your quote is ₹11.2L (within 15%). You can match at ₹10L and win on MSE preference.",
      "25% of government procurement on GeM is reserved for MSEs.",
      "Price preference applies only when you meet all technical eligibility criteria.",
      "Ensure Udyam status is active and product category matches tender specs.",
    ],
    formula: false,
  },
  {
    id: "treds",
    number: 4,
    title: "TReDS Invoice Discounting",
    subtitle: "RBI-regulated platform",
    icon: Banknote,
    summary:
      "Upload your invoice on TReDS (Trade Receivables Discounting System) → receive up to 95% of invoice value within ~3 days, instead of waiting 30–45 days for government payment.",
    details: [
      "Platforms: M1xchange, RXIL, Invoicemart (RBI-approved TReDS operators).",
      "Buyer (government department) must be registered on the TReDS platform.",
      "Discount fee is borne by buyer or seller per agreement — still faster than waiting.",
      "Useful when CRAC is generated but payment is delayed within the 45-day window.",
    ],
    formula: false,
    claimUrl: "https://www.treds.in/",
    claimLabel: "Learn about TReDS",
  },
  {
    id: "cpgrams",
    number: 5,
    title: "CPGRAMS Escalation",
    subtitle: "Centralized Public Grievance Redress System",
    icon: Gavel,
    summary:
      "If consignee follow-up, GeM incidents, and MSME ODR don't resolve the issue — file a formal grievance on pgportal.gov.in to escalate to the department's nodal officer.",
    details: [
      "Attach: order copy, invoice, CRAC, delivery proof, and prior correspondence.",
      "Select the correct ministry/department and grievance category.",
      "CPGRAMS assigns a tracking ID — escalation if not resolved in 30 days.",
      "Use alongside (not instead of) MSME ODR for payment disputes.",
    ],
    formula: false,
    claimUrl: "https://pgportal.gov.in/",
    claimLabel: "File on CPGRAMS",
  },
] as const;

export default function MsmeRightsPage() {
  return (
    <PageShell className="space-y-8">
      <PageHeader
        title="MSME Rights"
        backUrl="/"
        subtitle="Five legal and policy protections that can save lakhs per year — most sellers don't know these."
      />

      <div className="space-y-4">
        {RIGHTS.map((right) => {
          const Icon = right.icon;
          return (
            <Card key={right.id} id={right.id}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {right.number}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                      <CardTitle>{right.title}</CardTitle>
                    </div>
                    <CardDescription>{right.subtitle}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{right.summary}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {right.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-2">
                      <ArrowRight
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      {detail}
                    </li>
                  ))}
                </ul>

                {right.formula && (
                  <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                    <p className="mb-2 font-medium">How to calculate interest</p>
                    <p className="font-mono text-xs">
                      Interest = Principal × [(1 + r)<sup>n</sup> − 1] where r = (3 × RBI rate) ÷
                      12 and n = days overdue ÷ 30
                    </p>
                    <p className="mt-3 font-medium">Example (mock order)</p>
                    <ul className="mt-1 space-y-1 font-mono text-xs text-muted-foreground">
                      <li>Principal = {formatCurrency(EXAMPLE_PRINCIPAL)}</li>
                      <li>Days overdue = {EXAMPLE_DAYS_OVERDUE}</li>
                      <li>
                        Rate = 3 × {(RBI_NOTIFIED_RATE * 100).toFixed(2)}% ={" "}
                        {(PENALTY_RATE_ANNUAL * 100).toFixed(2)}% p.a.
                      </li>
                      <li>
                        Interest = {formatCurrency(EXAMPLE_PRINCIPAL)} × [(1 +{" "}
                        {(PENALTY_RATE_ANNUAL / 12).toFixed(6)})
                        <sup>{(EXAMPLE_DAYS_OVERDUE / 30).toFixed(2)}</sup> − 1] ={" "}
                        <strong className="text-foreground">
                          {formatCurrency(EXAMPLE_INTEREST)}
                        </strong>
                      </li>
                    </ul>
                    <p className="mt-2 text-xs text-muted-foreground">
                      How to claim: register on{" "}
                      <a
                        href="https://samadhaan.msme.gov.in/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        samadhaan.msme.gov.in
                      </a>{" "}
                      and file a delayed-payment complaint with invoice and CRAC proof.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{SOURCE_MSMED_RBI}</p>
                  </div>
                )}

                {"claimUrl" in right && right.claimUrl && (
                  <div>
                    {"internal" in right && right.internal ? (
                      <Link
                        href={right.claimUrl}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                      >
                        {right.claimLabel}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    ) : (
                      <a
                        href={right.claimUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
                      >
                        {right.claimLabel}
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="print-content print-expand">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Legal notice template — delayed payment</CardTitle>
          </div>
          <CardDescription>
            Send before filing on MSME ODR. Pre-filled with mock overdue order data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LegalNoticeTemplate />
        </CardContent>
      </Card>

      <Link
        href="/payments"
        className="no-print inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        <IndianRupee className="size-4" aria-hidden="true" />
        Check your payments
      </Link>

      <Disclaimer />
      <p className="text-xs text-muted-foreground">
        {SOURCE_BUSINESS_STANDARD}. Legal claims: {SOURCE_MSMED_RBI}.
      </p>
    </PageShell>
  );
}

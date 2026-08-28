import Link from "next/link";
import { ArrowLeft, ArrowRight, Banknote, ExternalLink, FileText, Gavel, IndianRupee, Scale, Shield, TrendingUp } from "lucide-react";

import { Disclaimer } from "@/components/Disclaimer";
import { LegalNoticeTemplate } from "@/components/LegalNoticeTemplate";
import { PageShell } from "@/components/PageShell";
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
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

const RIGHTS = [
  {
    id: "delayed-payment",
    number: 1,
    title: "Delayed Payment Interest",
    subtitle: "Section 16, MSMED Act, 2006",
    icon: Scale,
    summary: "If the buyer doesn't pay within 45 days of accepting goods or services, you are legally entitled to compound interest at 3× the RBI bank rate, compounded monthly.",
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
    summary: "Registered MSE sellers on GeM are exempt from depositing Earnest Money (EMD) when bidding — a major cash-flow advantage over non-MSE competitors.",
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
    summary: "If L1 (lowest bidder) is a non-MSE, you can match the L1 price if your quote is within L1+15% — and receive up to 25% of the order value under MSE reservation.",
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
    summary: "Upload your invoice on TReDS (Trade Receivables Discounting System) → receive up to 95% of invoice value within ~3 days, instead of waiting 30–45 days for government payment.",
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
    summary: "If consignee follow-up, GeM incidents, and MSME ODR don't resolve the issue — file a formal grievance on pgportal.gov.in to escalate to the department's nodal officer.",
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
    <PageShell className="space-y-6">
      {/* Back link */}
      <Link href="/payments" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="size-3" />Back to payments
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">MSME Rights</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Five legal protections that save lakhs</h1>
        <p className="mt-1 text-sm text-muted-foreground">Most sellers don&apos;t know these exist. Here&apos;s what the MSMED Act gives you.</p>
      </div>

      {/* Rights cards */}
      <div className="space-y-4">
        {RIGHTS.map((right) => {
          const Icon = right.icon;
          return (
            <div key={right.id} id={right.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">{right.number}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <p className="text-sm font-bold">{right.title}</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{right.subtitle}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{right.summary}</p>
                  <ul className="mt-2 space-y-1">
                    {right.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                        <ArrowRight className="mt-0.5 size-3 shrink-0 text-primary" />{detail}
                      </li>
                    ))}
                  </ul>

                  {right.formula && (
                    <div className="mt-3 rounded-lg border bg-muted/30 p-3">
                      <p className="mb-1 text-[10px] font-bold">How to calculate interest</p>
                      <p className="font-mono text-[9px]">Interest = Principal × [(1 + r)<sup>n</sup> − 1] where r = (3 × RBI rate) ÷ 12 and n = days overdue ÷ 30</p>
                      <p className="mt-2 text-[10px] font-semibold">Example</p>
                      <ul className="mt-1 space-y-0.5 font-mono text-[9px] text-muted-foreground">
                        <li>Principal = {formatCurrency(EXAMPLE_PRINCIPAL)}</li>
                        <li>Days overdue = {EXAMPLE_DAYS_OVERDUE}</li>
                        <li>Rate = {(PENALTY_RATE_ANNUAL * 100).toFixed(2)}% p.a.</li>
                        <li>Interest = <strong className="text-foreground">{formatCurrency(EXAMPLE_INTEREST)}</strong></li>
                      </ul>
                      <p className="mt-1.5 text-[9px] text-muted-foreground">File on <a href="https://samadhaan.msme.gov.in/" target="_blank" rel="noopener noreferrer" className="underline">samadhaan.msme.gov.in</a> with invoice + CRAC proof.</p>
                      <p className="mt-1 text-[9px] text-muted-foreground">{SOURCE_MSMED_RBI}</p>
                    </div>
                  )}

                  {"claimUrl" in right && right.claimUrl && (
                    <div className="mt-3">
                      {"internal" in right && right.internal ? (
                        <Link href={right.claimUrl} className="inline-flex min-h-9 items-center gap-1 rounded-lg border px-3 text-xs font-semibold transition hover:bg-muted/50">
                          {right.claimLabel}<ArrowRight className="size-3" />
                        </Link>
                      ) : (
                        <a href={right.claimUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 rounded-lg border px-3 text-xs font-semibold transition hover:bg-muted/50">
                          {right.claimLabel}<ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legal notice */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="size-4 text-primary" />
          <p className="text-sm font-bold">Legal notice template — delayed payment</p>
        </div>
        <p className="mb-3 text-[10px] text-muted-foreground">Send before filing on MSME ODR. Pre-filled with mock overdue order data.</p>
        <LegalNoticeTemplate />
      </div>

      <Link href="/payments" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl gradient-cta px-5 text-sm font-semibold text-white">
        <IndianRupee className="size-4" />Check your payments
      </Link>

      <Disclaimer />
      <p className="text-[9px] text-muted-foreground">{SOURCE_BUSINESS_STANDARD}. Legal claims: {SOURCE_MSMED_RBI}.</p>
    </PageShell>
  );
}

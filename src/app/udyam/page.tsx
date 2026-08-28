"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  ExternalLink,
  IndianRupee,
  Shield,
  TrendingUp,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { UdyamQualificationCheck } from "@/components/UdyamQualificationCheck";

const BENEFITS = [
  { title: "EMD exemption", description: "Saves ₹5K–50K per bid — no earnest money deposit for registered MSEs.", icon: IndianRupee, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
  { title: "25% procurement reservation", description: "Government buyers must procure 25% from MSEs on GeM.", icon: Shield, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
  { title: "Price preference (L1+15%)", description: "If your quote is within 15% of L1, you can match and win on MSE preference.", icon: TrendingUp, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40" },
] as const;

const STEPS = [
  "Visit udyamregistration.gov.in and click \"For New Entrepreneurs who are not registered yet as MSME\".",
  "Enter your Aadhaar number and verify with OTP.",
  "Validate PAN — name must match Aadhaar exactly.",
  "Fill business details: type, address, bank account, investment & turnover (in ₹ lakhs/crore).",
  "Select NIC code for your primary business activity.",
  "Review and submit — Udyam certificate is generated instantly (free, no fees).",
  "Download certificate and link your Udyam Registration Number (URN) on your GeM seller profile.",
] as const;

const MISTAKES = [
  "Wrong turnover figures — mismatched with GST returns can flag your registration.",
  "Not linking Udyam to GeM — benefits like EMD exemption won't apply until linked.",
  "Name mismatch across Aadhaar, PAN, and bank — same issue that blocks GeM KYC.",
  "Selecting wrong NIC code — affects category eligibility on tenders.",
] as const;

const UDYAM_PORTAL_URL = "https://udyamregistration.gov.in/";

export default function UdyamPage() {
  return (
    <PageShell className="space-y-5">
      {/* Header */}
      <div>
        <button type="button" onClick={() => window.history.back()} className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-3" /> Back
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Udyam Registration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Register on Udyam FIRST — unlock ₹5L+ in MSE benefits. Udyam is mandatory to claim MSE benefits on GeM.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid gap-3 sm:grid-cols-3">
        {BENEFITS.map(({ title, description, icon: Icon, color }) => (
          <div key={title} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className={`flex size-9 items-center justify-center rounded-lg ${color} mb-3`}>
              <Icon className="size-5" />
            </div>
            <p className="text-sm font-bold">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      {/* What is Udyam */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BadgeCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold">What is Udyam?</p>
            <p className="text-xs text-muted-foreground">Mandatory MSME registration for GeM benefits</p>
          </div>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>Udyam Registration (formerly Udyog Aadhaar) is the official MSME certificate issued by the Ministry of MSME. Without it, you are treated as a non-MSE seller on GeM — meaning you pay EMD on every bid and miss 25% reserved procurement categories.</p>
          <p>Sahayak recommends completing Udyam <strong className="text-foreground">before</strong> your first GeM bid — it is the single highest-ROI step for new sellers.</p>
        </div>
      </div>

      {/* Qualification check */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold">Qualification check</p>
        <p className="mb-3 text-xs text-muted-foreground">Investment in plant & machinery (excluding land & building)</p>
        <UdyamQualificationCheck />
      </div>

      {/* Registration steps */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <p className="mb-3 text-sm font-bold">Registration steps (~15 minutes, free)</p>
        <ol className="space-y-2">
          {STEPS.map((step, i) => (
            <li key={step} className="flex gap-2 text-xs">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
        <a
          href={UDYAM_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Start Udyam registration
          <ExternalLink className="size-4" />
        </a>
      </div>

      {/* Common mistakes */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertTriangle className="size-5" />
          </div>
          <p className="text-sm font-bold">Common mistakes to avoid</p>
        </div>
        <div className="space-y-1.5">
          {MISTAKES.map((mistake) => (
            <div key={mistake} className="flex items-start gap-2 rounded-lg bg-red-50/50 px-3 py-2 text-xs text-red-800 dark:bg-red-950/20 dark:text-red-300">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-red-500" />
              {mistake}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  FileKey,
  IndianRupee,
  Monitor,
  Shield,
  Wifi,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { TechnicalHealthCheck } from "@/components/TechnicalHealthCheck";
import {
  MOCK_DSC,
  checkDSCStatus,
  getDSCCost,
  getDSCRenewalSteps,
} from "@/lib/rules/dsc-tracker";

const SESSION_TIPS = [
  "Prepare all documents offline in a dedicated folder before logging in",
  "Save your bid draft frequently — GeM does not auto-save everything",
  "Use Google Chrome or Microsoft Edge (latest version)",
  "Keep DSC token plugged in before starting bid submission",
  "Set a phone timer for 20 minutes to re-save before session timeout",
] as const;

const AUTO_SAVE_CHECKLIST = [
  "Product specifications PDF",
  "Price worksheet (unit cost breakdown)",
  "EMD payment proof / exemption certificate",
  "Delivery timeline commitment",
  "PAN, GST, and Udyam certificates",
  "Past performance / experience documents",
] as const;

const EMD_CHECKS = [
  "Is the EMD amount correct for this tender? (usually 1–3% of estimated value)",
  "Have you claimed MSE exemption? (requires linked Udyam registration)",
  "Did you pay via NEFT/RTGS at least 1 day before the deadline?",
  "Has EMD reflected in your GeM wallet? (takes 2–4 hours)",
] as const;

function statusColor(status: ReturnType<typeof checkDSCStatus>["status"]) {
  switch (status) {
    case "valid": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
    case "expiring": return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
    case "expired": return "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400";
  }
}

export default function BidPrepPage() {
  const dscStatus = checkDSCStatus(MOCK_DSC);
  const dscCost = getDSCCost();
  const renewalSteps = getDSCRenewalSteps();

  return (
    <PageShell className="space-y-5">
      {/* Header */}
      <div>
        <button type="button" onClick={() => window.history.back()} className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-3" /> Back
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Bid Preparation Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          DSC, session timeouts, technical checks, and EMD timing — everything that blocks sellers at the last minute.
        </p>
      </div>

      {/* DSC Status Card */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileKey className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Digital Signature Certificate (DSC)</p>
              <p className="text-xs text-muted-foreground">{MOCK_DSC.holderName} · {MOCK_DSC.provider}</p>
            </div>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusColor(dscStatus.status)}`}>
            {dscStatus.status === "valid" ? "✓ Valid" : dscStatus.status === "expiring" ? "⚠ Expiring" : "✗ Expired"}
          </span>
        </div>

        <div className="rounded-lg bg-muted/30 p-3 mb-3">
          <p className="text-xs text-muted-foreground">Current status</p>
          <p className="text-lg font-bold">
            {dscStatus.status === "expiring"
              ? `Expiring in ${dscStatus.daysUntilExpiry} days`
              : dscStatus.status === "expired"
                ? "Expired — renewal required"
                : `Valid — ${dscStatus.daysUntilExpiry} days remaining`}
          </p>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          <strong className="text-foreground">Why DSC matters:</strong> Required for bid submission on GeM. No DSC = can&apos;t bid.
        </p>

        {/* Renewal steps */}
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Renewal steps (3–7 days)</p>
        <ol className="space-y-1.5 mb-3">
          {renewalSteps.map((step, i) => (
            <li key={step} className="flex gap-2 text-xs">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>

        <div className="grid gap-2 text-xs sm:grid-cols-3 mb-3">
          <div className="rounded-lg bg-muted/30 p-2"><span className="text-muted-foreground">Cost:</span> <span className="font-semibold">{dscCost.cost}</span></div>
          <div className="rounded-lg bg-muted/30 p-2"><span className="text-muted-foreground">Validity:</span> <span className="font-semibold">{dscCost.validity}</span></div>
          <div className="rounded-lg bg-muted/30 p-2"><span className="text-muted-foreground">Providers:</span> <span className="font-semibold">{dscCost.providers.join(", ")}</span></div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <p><strong>Renew BEFORE it expires.</strong> Expired DSC = locked out of GeM bid submission.</p>
        </div>
      </div>

      {/* Session Timeout */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Session Timeout Protection</p>
            <p className="text-xs text-muted-foreground">GeM sessions expire in 15–30 minutes of inactivity</p>
          </div>
        </div>
        <ul className="space-y-1.5">
          {SESSION_TIPS.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Auto-save checklist */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CheckCircle2 className="size-5" />
          </div>
          <p className="text-sm font-bold">Auto-save checklist</p>
        </div>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {AUTO_SAVE_CHECKLIST.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 text-xs">
              <span className="size-3.5 shrink-0 rounded border border-muted-foreground/30" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* EMD checks */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <IndianRupee className="size-5" />
          </div>
          <p className="text-sm font-bold">EMD timing checks</p>
        </div>
        <div className="space-y-1.5">
          {EMD_CHECKS.map((check) => (
            <div key={check} className="flex items-start gap-2 rounded-lg bg-muted/30 px-3 py-2 text-xs">
              <span className="mt-0.5 size-3.5 shrink-0 rounded border border-muted-foreground/30" />
              {check}
            </div>
          ))}
        </div>
      </div>

      {/* Technical health check */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Monitor className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Technical Health Check</p>
            <p className="text-xs text-muted-foreground">Browser, internet, and device readiness</p>
          </div>
        </div>
        <TechnicalHealthCheck />
      </div>
    </PageShell>
  );
}

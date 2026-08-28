"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileKey,
  FileText,
  IndianRupee,
  Monitor,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { TechnicalHealthCheck } from "@/components/TechnicalHealthCheck";
import { SellerProfile } from "@/lib/schemas";
import {
  MOCK_DSC,
  checkDSCStatus,
  getDSCCost,
  getDSCRenewalSteps,
} from "@/lib/rules/dsc-tracker";
import { validateDocuments } from "@/lib/rules/registration";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

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

function dscStatusStyles(status: ReturnType<typeof checkDSCStatus>["status"]) {
  switch (status) {
    case "valid":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    case "expiring":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    case "expired":
      return "bg-red-500/15 text-red-700 dark:text-red-400";
  }
}

function checkIcon(status: "pass" | "warn" | "fail") {
  if (status === "pass") return <CheckCircle2 className="size-5 text-emerald-600" />;
  if (status === "warn") return <AlertTriangle className="size-5 text-amber-600" />;
  return <XCircle className="size-5 text-destructive" />;
}

export default function BidPrepPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const dscStatus = checkDSCStatus(MOCK_DSC);
  const dscCost = getDSCCost();
  const renewalSteps = getDSCRenewalSteps();

  useEffect(() => {
    const profile = getSeller();
    if (!profile) {
      router.replace("/setup");
      return;
    }
    setSeller(profile);
  }, [router]);

  const docValidation = useMemo(() => {
    if (!seller) return null;
    return validateDocuments({
      ...seller,
      email: "seller@demo.local",
      bankAccount: seller.bankVerified ? "123456789012" : "",
      ifsc: seller.bankVerified ? "SBIN0001234" : "",
    });
  }, [seller]);

  if (!seller || !docValidation) {
    return (
      <PageShell wide>
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </PageShell>
    );
  }

  const passCount = docValidation.checks.filter((c) => c.status === "pass").length;
  const failCount = docValidation.checks.filter((c) => c.status === "fail").length;

  return (
    <PageShell wide className="space-y-5">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl gradient-hero p-5 text-white shadow-xl md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(96,165,250,0.25)_0%,_transparent_55%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">
              Document verification
            </p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Bid preparation hub
            </h1>
            <p className="max-w-xl text-sm text-blue-100/85">
              Verify PAN, GST, bank, and DSC before you bid — fix blockers here so GeM
              submission goes smoothly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center backdrop-blur">
              <p className="text-xl font-bold tabular-nums">{passCount}</p>
              <p className="text-[9px] font-semibold uppercase text-blue-200/80">Passed</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center backdrop-blur">
              <p className="text-xl font-bold tabular-nums text-amber-200">{failCount}</p>
              <p className="text-[9px] font-semibold uppercase text-blue-200/80">Need fix</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-2.5 text-center backdrop-blur">
              <p className="text-xl font-bold tabular-nums">{docValidation.score}%</p>
              <p className="text-[9px] font-semibold uppercase text-blue-200/80">Ready</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-12">
        {/* Document checks — primary column */}
        <section className="space-y-4 lg:col-span-7">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">Document verification</h2>
                  <p className="text-xs text-muted-foreground">
                    {seller.businessName} · {seller.city}
                  </p>
                </div>
              </div>
              <Link
                href="/setup"
                className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Edit profile
              </Link>
            </div>

            <div className="space-y-2">
              {docValidation.checks.map((check) => (
                <div
                  key={check.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4",
                    check.status === "pass" && "border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20",
                    check.status === "warn" && "border-amber-200/60 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20",
                    check.status === "fail" && "border-destructive/30 bg-destructive/5"
                  )}
                >
                  <div className="mt-0.5 shrink-0">{checkIcon(check.status)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{check.label}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          check.status === "pass" && "bg-emerald-100 text-emerald-700",
                          check.status === "warn" && "bg-amber-100 text-amber-700",
                          check.status === "fail" && "bg-red-100 text-red-700"
                        )}
                      >
                        {check.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {check.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-save checklist */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              <h2 className="text-sm font-bold">Bid folder checklist</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {AUTO_SAVE_CHECKLIST.map((item) => (
                <label
                  key={item}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-xs transition hover:bg-muted/50"
                >
                  <input type="checkbox" className="size-3.5 rounded border-input" />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Right column — DSC + session + health */}
        <aside className="space-y-4 lg:col-span-5">
          {/* DSC card */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileKey className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Digital Signature (DSC)</p>
                  <p className="text-[10px] text-muted-foreground">
                    {MOCK_DSC.holderName} · {MOCK_DSC.provider}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
                  dscStatusStyles(dscStatus.status)
                )}
              >
                {dscStatus.status === "valid"
                  ? "Valid"
                  : dscStatus.status === "expiring"
                    ? "Expiring"
                    : "Expired"}
              </span>
            </div>

            <div className="mb-3 rounded-xl bg-muted/40 p-4 text-center">
              <p className="text-2xl font-extrabold tabular-nums">
                {dscStatus.status === "expiring"
                  ? `${dscStatus.daysUntilExpiry} days`
                  : dscStatus.status === "expired"
                    ? "Renew now"
                    : `${dscStatus.daysUntilExpiry} days left`}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">until expiry</p>
            </div>

            <ol className="mb-3 space-y-2">
              {renewalSteps.slice(0, 3).map((step, i) => (
                <li key={step} className="flex gap-2 text-xs">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="rounded-lg bg-muted/40 p-2">
                <p className="text-muted-foreground">Cost</p>
                <p className="font-semibold">{dscCost.cost}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <p className="text-muted-foreground">Validity</p>
                <p className="font-semibold">{dscCost.validity}</p>
              </div>
              <div className="rounded-lg bg-muted/40 p-2">
                <p className="text-muted-foreground">Providers</p>
                <p className="font-semibold truncate">{dscCost.providers[0]}</p>
              </div>
            </div>

            {dscStatus.status !== "valid" && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                <p>Renew before expiry — expired DSC blocks all GeM bid submissions.</p>
              </div>
            )}
          </div>

          {/* Session timeout */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="size-5 text-amber-600" />
              <h2 className="text-sm font-bold">Session timeout tips</h2>
            </div>
            <ul className="space-y-2">
              {SESSION_TIPS.slice(0, 4).map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Technical health */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Monitor className="size-5 text-emerald-600" />
              <h2 className="text-sm font-bold">Technical health check</h2>
            </div>
            <TechnicalHealthCheck />
          </div>
        </aside>

        {/* EMD — full width bottom */}
        <div className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-12">
          <div className="mb-3 flex items-center gap-2">
            <IndianRupee className="size-5 text-violet-600" />
            <h2 className="text-sm font-bold">EMD timing checks</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {EMD_CHECKS.map((check) => (
              <div
                key={check}
                className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2.5 text-xs"
              >
                <span className="mt-0.5 size-3.5 shrink-0 rounded border border-muted-foreground/30" />
                {check}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

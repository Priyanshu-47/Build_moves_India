import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  FileKey,
  IndianRupee,
  Monitor,
  Shield,
  Wifi,
} from "lucide-react";

import { Disclaimer } from "@/components/Disclaimer";
import { PageShell } from "@/components/PageShell";
import { TechnicalHealthCheck } from "@/components/TechnicalHealthCheck";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

function statusBadge(status: ReturnType<typeof checkDSCStatus>["status"]) {
  switch (status) {
    case "valid":
      return <Badge variant="default">Valid</Badge>;
    case "expiring":
      return <Badge variant="secondary">Expiring soon</Badge>;
    case "expired":
      return <Badge variant="destructive">Expired</Badge>;
  }
}

export default function BidPrepPage() {
  const dscStatus = checkDSCStatus(MOCK_DSC);
  const dscCost = getDSCCost();
  const renewalSteps = getDSCRenewalSteps();

  return (
    <PageShell className="space-y-8">
      <section className="space-y-3 text-center sm:text-left">
        <p className="text-sm font-medium text-primary">Bid Preparation Hub</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Get bid-ready before you lose the window
        </h1>
        <p className="text-muted-foreground">
          DSC, session timeouts, technical checks, and EMD timing — everything that blocks
          sellers at the last minute.
        </p>
      </section>

      <Card id="dsc">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileKey className="size-5 text-primary" aria-hidden="true" />
              <CardTitle>Digital Signature Certificate (DSC)</CardTitle>
            </div>
            {statusBadge(dscStatus.status)}
          </div>
          <CardDescription>
            {MOCK_DSC.holderName} · {MOCK_DSC.provider} · expires {MOCK_DSC.expiryDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Current status</p>
            <p className="mt-1 text-2xl font-bold">
              {dscStatus.status === "expiring"
                ? `Expiring in ${dscStatus.daysUntilExpiry} days`
                : dscStatus.status === "expired"
                  ? "Expired — renewal required"
                  : `Valid — ${dscStatus.daysUntilExpiry} days remaining`}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Why DSC matters:</strong> Required for bid
            submission on GeM. No DSC = can&apos;t bid. No exceptions.
          </p>

          <div>
            <p className="mb-2 text-sm font-medium">Renewal steps (3–7 days)</p>
            <ol className="space-y-2">
              {renewalSteps.map((step, index) => (
                <li key={step} className="flex gap-2 text-sm">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-2 text-sm sm:grid-cols-3">
            <p>
              <span className="text-muted-foreground">Cost:</span> {dscCost.cost}
            </p>
            <p>
              <span className="text-muted-foreground">Validity:</span> {dscCost.validity}
            </p>
            <p>
              <span className="text-muted-foreground">Providers:</span>{" "}
              {dscCost.providers.join(", ")}
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              <strong>Renew BEFORE it expires.</strong> Expired DSC = locked out of GeM bid
              submission until you get a new token.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card id="session">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Session Timeout Protection</CardTitle>
          </div>
          <CardDescription>GeM sessions expire in 15–30 minutes of inactivity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm">
            {SESSION_TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-muted-foreground">
                <Monitor className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>

          <div>
            <p className="mb-2 text-sm font-medium">Auto-save checklist — keep docs ready</p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {AUTO_SAVE_CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card id="health">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wifi className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Technical Health Check</CardTitle>
          </div>
          <CardDescription>Run before every bid submission or live auction</CardDescription>
        </CardHeader>
        <CardContent>
          <TechnicalHealthCheck />
        </CardContent>
      </Card>

      <Card id="emd">
        <CardHeader>
          <div className="flex items-center gap-2">
            <IndianRupee className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>EMD Payment Timeline</CardTitle>
          </div>
          <CardDescription>Earnest Money Deposit — don&apos;t miss the deadline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            EMD via NEFT/RTGS takes <strong>2–4 hours</strong> to reflect in your GeM wallet.
            Pay at least <strong>1 day before</strong> the bid deadline to avoid disqualification.
          </p>

          <div className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3 text-sm">
            <Shield className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
            <p>
              MSE sellers with linked Udyam registration are exempt from EMD — verify exemption
              is active on your GeM profile before skipping payment.
            </p>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Pre-submission checks</p>
            <ul className="space-y-2">
              {EMD_CHECKS.map((check) => (
                <li key={check} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {check}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/opportunities"
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 sm:w-auto"
      >
        Find opportunities
      </Link>

      <Disclaimer />
    </PageShell>
  );
}

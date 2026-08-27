"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  CheckCircle2,
  FileWarning,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SellerProfile } from "@/lib/schemas";
import {
  CorrigendumSeverity,
  detectChanges,
  getCorrigendumImpact,
  loadCorrigenda,
} from "@/lib/rules/corrigendum";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

const corrigenda = loadCorrigenda();

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (value >= 1000) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);
    }
    return String(value);
  }
  return String(value);
}

function severityBadge(severity: CorrigendumSeverity) {
  const variants: Record<CorrigendumSeverity, "default" | "secondary" | "destructive"> = {
    minor: "secondary",
    moderate: "default",
    major: "default",
    critical: "destructive",
  };
  return (
    <Badge variant={variants[severity]} className="uppercase">
      {severity}
    </Badge>
  );
}

function readinessColor(score: number): string {
  if (score > 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

export default function CorrigendaPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [selectedId, setSelectedId] = useState(corrigenda[0]?.id ?? "");

  useEffect(() => {
    const profile = getSeller();
    if (!profile) {
      router.replace("/setup");
      return;
    }
    setSeller(profile);
    setReady(true);
  }, [router]);

  const selected = useMemo(
    () => corrigenda.find((item) => item.id === selectedId) ?? corrigenda[0],
    [selectedId]
  );

  const analysis = useMemo(() => {
    if (!seller || !selected) return null;
    const detection = detectChanges(
      selected.originalBid,
      selected.amendedBid,
      seller
    );
    const impact = getCorrigendumImpact(detection.changes, detection);
    return { detection, impact };
  }, [seller, selected]);

  if (!ready || !seller || !selected || !analysis) {
    return (
      <PageShell>
        <CardSkeleton rows={8} />
      </PageShell>
    );
  }

  const { detection, impact } = analysis;

  return (
    <PageShell className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-medium text-primary">Corrigendum Intelligence</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Bid changed? Your readiness may no longer be valid.
        </h1>
        <p className="text-sm text-muted-foreground">
          GeM corrigenda can change specs, quantity, and eligibility overnight. Sahayak
          flags what shifted and whether you should still bid.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active corrigenda</CardTitle>
          <CardDescription>Recent amendments on tenders you may be tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {corrigenda.map((item) => {
            const preview = detectChanges(item.originalBid, item.amendedBid, seller);
            const isActive = item.id === selected.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "w-full rounded-lg border p-4 text-left transition-colors",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/30 hover:bg-muted/30"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Published {formatDate(item.publishedDate)} · Corrigendum #
                      {item.corrigendumNumber}
                    </p>
                  </div>
                  {severityBadge(preview.severity)}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {getCorrigendumImpact(preview.changes, preview).summary}
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span className={readinessColor(preview.readinessImpact.before)}>
                    Was {preview.readinessImpact.before}%
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className={readinessColor(preview.readinessImpact.after)}>
                    Now {preview.readinessImpact.after}%
                  </span>
                  {preview.readinessImpact.delta < 0 && (
                    <span className="inline-flex items-center text-destructive">
                      <ArrowDownRight className="size-4" aria-hidden="true" />
                      {preview.readinessImpact.delta}%
                    </span>
                  )}
                </p>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <FileWarning className="size-5 text-amber-600" aria-hidden="true" />
            <CardTitle className="text-base">What changed</CardTitle>
            {severityBadge(detection.severity)}
          </div>
          <CardDescription>{impact.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[480px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Field</th>
                  <th className="px-3 py-2 font-medium">Before</th>
                  <th className="px-3 py-2 font-medium">After</th>
                  <th className="px-3 py-2 font-medium">Impact</th>
                </tr>
              </thead>
              <tbody>
                {detection.changes.map((change) => (
                  <tr key={change.field} className="border-t">
                    <td className="px-3 py-2 font-medium">{change.field}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {formatValue(change.oldValue)}
                    </td>
                    <td className="px-3 py-2">{formatValue(change.newValue)}</td>
                    <td className="px-3 py-2 capitalize text-muted-foreground">
                      {change.impact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {detection.readinessImpact.affectedChecks.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/20">
              <p className="font-medium">Readiness checks affected</p>
              <ul className="mt-1 list-inside list-disc text-muted-foreground">
                {detection.readinessImpact.affectedChecks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-muted-foreground">{impact.whatItMeans}</p>
        </CardContent>
      </Card>

      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-base">Readiness impact</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            Was{" "}
            <strong className={readinessColor(detection.readinessImpact.before)}>
              {detection.readinessImpact.before}%
            </strong>{" "}
            → Now{" "}
            <strong className={readinessColor(detection.readinessImpact.after)}>
              {detection.readinessImpact.after}%
            </strong>
          </p>
          {detection.newBlockers.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {detection.newBlockers.map((blocker) => (
                <li key={blocker} className="flex items-start gap-2 text-destructive">
                  <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {blocker}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your options</CardTitle>
          <CardDescription>{impact.actionRequired}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-4 dark:border-green-900 dark:bg-green-950/20">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="size-4 text-green-600" aria-hidden="true" />
              Fix blockers
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Address new gaps — e.g. ISO 9001 (4–6 weeks, ~₹25,000) or scale capacity before
              rebidding.
            </p>
            <Link
              href={`/opportunities/${selected.bidId}/readiness`}
              className={buttonVariants({ size: "sm", className: "mt-3" })}
            >
              Open readiness checklist
            </Link>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2 font-medium">
              <ShieldAlert className="size-4 text-muted-foreground" aria-hidden="true" />
              Walk away
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Save time and capacity for tenders where you are already compliant and ready.
            </p>
            <Link
              href="/opportunities"
              className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}
            >
              Browse other bids
            </Link>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" />
              Bid anyway
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Risk: {detection.readinessImpact.after}% readiness — likely technical rejection or
              margin squeeze if specs are not met.
            </p>
            <Link
              href={`/simulate?bid=${selected.bidId}`}
              className={buttonVariants({ variant: "outline", size: "sm", className: "mt-3" })}
            >
              Re-run cost simulation
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prevent corrigendum shock</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            <li>Check the bid daily for corrigenda until the submission window closes.</li>
            <li>Don&apos;t invest heavily in pricing or documents until the corrigendum window passes.</li>
            <li>Most corrigenda are published within the first 7 days of a bid going live.</li>
          </ul>
        </CardContent>
      </Card>
    </PageShell>
  );
}

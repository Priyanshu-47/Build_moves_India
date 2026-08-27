"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  ExternalLink,
  XCircle,
} from "lucide-react";

import bidsData from "@/data/bids.json";
import comparablesData from "@/data/comparables.json";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChecklistItem, SellerProfile, parseBids, parseComparables } from "@/lib/schemas";
import { computePriceIntelligence } from "@/lib/rules/pricing";
import { computeReadiness } from "@/lib/rules/readiness";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildChecklist(
  seller: SellerProfile,
  bid: ReturnType<typeof parseBids>[number],
  readinessScore: number
): ChecklistItem[] {
  const needsBis = bid.requiredCertifications.some((cert) =>
    cert.toLowerCase().includes("bis")
  );
  const hasBis = seller.certifications.some((cert) =>
    cert.toLowerCase().includes("bis")
  );

  return [
    {
      id: "gst",
      label: "GST registration certificate",
      completed: Boolean(seller.gstin),
      required: true,
    },
    {
      id: "pan",
      label: "PAN card (business)",
      completed: Boolean(seller.pan),
      required: true,
    },
    {
      id: "bis",
      label: "BIS certificate (if required)",
      completed: !needsBis || hasBis,
      required: needsBis,
    },
    {
      id: "emd",
      label: bid.emdAmount
        ? `EMD deposit of ${formatCurrency(bid.emdAmount)}`
        : "EMD deposit (not required)",
      completed: !bid.emdAmount,
      required: Boolean(bid.emdAmount),
    },
    {
      id: "delivery",
      label: `Delivery commitment within ${bid.deliveryDays} days`,
      completed: readinessScore >= 60,
      required: true,
    },
  ];
}

export default function PreparePage() {
  const router = useRouter();
  const params = useParams<{ bidId: string }>();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);

  const bid = useMemo(() => {
    return parseBids(bidsData).find((item) => item.id === params.bidId) ?? null;
  }, [params.bidId]);

  const readiness = useMemo(() => {
    if (!seller || !bid) return null;
    return computeReadiness(seller, bid);
  }, [seller, bid]);

  const pricing = useMemo(() => {
    if (!seller || !bid) return null;
    return computePriceIntelligence(bid, seller, parseComparables(comparablesData));
  }, [seller, bid]);

  const checklist = useMemo(() => {
    if (!seller || !bid || !readiness) return [];
    return buildChecklist(seller, bid, readiness.readinessScore);
  }, [seller, bid, readiness]);

  const criticalBlockers = useMemo(() => {
    return (
      readiness?.blockers.filter((blocker) => blocker.severity === "critical") ?? []
    );
  }, [readiness]);

  const readyToSubmit =
    criticalBlockers.length === 0 &&
    (readiness?.readinessScore ?? 0) >= 75 &&
    checklist.filter((item) => item.required && !item.completed).length === 0;

  useEffect(() => {
    const profile = getSeller();
    if (!profile) {
      router.replace("/setup");
      return;
    }
    setSeller(profile);
    setReady(true);
  }, [router]);

  if (!ready || !seller) {
    return (
      <PageShell>
        <CardSkeleton rows={3} />
        <div className="mt-4 space-y-4">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={5} />
        </div>
      </PageShell>
    );
  }

  if (!bid || !readiness || !pricing) {
    return (
      <PageShell>
        <PageHeader title="Prepare Bid" backUrl="/opportunities" />
        <p className="text-sm text-muted-foreground">Bid not found.</p>
      </PageShell>
    );
  }

  const recommendedMid =
    (pricing.recommendedRange.low + pricing.recommendedRange.high) / 2;

  return (
    <PageShell>
      <PageHeader
        title="Prepare Bid"
        backUrl={`/opportunities/${bid.id}`}
        subtitle={bid.title}
      />

      <Card
        className={cn(
          "mb-4",
          readyToSubmit
            ? "border-green-200 bg-green-50"
            : "border-amber-200 bg-amber-50"
        )}
      >
        <CardContent className="flex items-center gap-3 pt-6">
          {readyToSubmit ? (
            <CheckCircle2 className="size-8 shrink-0 text-green-600" aria-hidden="true" />
          ) : (
            <XCircle className="size-8 shrink-0 text-amber-600" aria-hidden="true" />
          )}
          <div>
            <p
              className={cn(
                "text-lg font-semibold",
                readyToSubmit ? "text-green-900" : "text-amber-900"
              )}
            >
              {readyToSubmit ? "Bid Ready" : "Fix Blockers First"}
            </p>
            <p
              className={cn(
                "text-sm",
                readyToSubmit ? "text-green-800" : "text-amber-800"
              )}
            >
              {readyToSubmit
                ? "Your profile, readiness, and pricing look good. Proceed to GeM to submit."
                : "Resolve blockers and complete the checklist before submitting on GeM."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Bid summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Department</p>
              <p className="font-medium">{bid.department}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">
                {bid.location.city}, {bid.location.state}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">
                {bid.quantity.toLocaleString("en-IN")} {bid.unit}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Deadline</p>
              <p className="font-medium">{formatDeadline(bid.deadline)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness status</CardTitle>
            <CardDescription>From your readiness check</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{readiness.readinessScore}%</p>
            {criticalBlockers.length > 0 ? (
              <ul className="mt-2 space-y-1 text-sm text-red-800">
                {criticalBlockers.map((blocker) => (
                  <li key={`${blocker.code}-${blocker.message}`}>• {blocker.message}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                No critical blockers remaining.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing recommendation</CardTitle>
            <CardDescription>Per-unit bid price</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-lg font-semibold text-green-700">
              {formatCurrency(pricing.recommendedRange.low)} –{" "}
              {formatCurrency(pricing.recommendedRange.high)} / unit
            </p>
            <p className="text-muted-foreground">
              Suggested total:{" "}
              {formatCurrency(recommendedMid * bid.quantity)} for {bid.quantity}{" "}
              {bid.unit}
            </p>
            <p className="text-muted-foreground">
              Estimated margin: {formatCurrency(pricing.estimatedMargin.amount)} (
              {pricing.estimatedMargin.percent}%) per unit
            </p>
          </CardContent>
        </Card>

        <Card className="print-content print-expand">
          <CardHeader>
            <CardTitle>Submission checklist</CardTitle>
            <CardDescription>Documents and commitments needed</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-start gap-2 text-sm">
                  {item.completed ? (
                    <CheckCircle2
                      className="mt-0.5 size-4 shrink-0 text-green-600"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle
                      className="mt-0.5 size-4 shrink-0 text-red-600"
                      aria-hidden="true"
                    />
                  )}
                  <span className={item.completed ? "text-foreground" : "text-red-800"}>
                    {item.label}
                    {item.required && !item.completed ? " (required)" : ""}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <a
          href="https://gem.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({
            size: "lg",
            className: "h-11 w-full gap-2",
          })}
        >
          Submit on GeM
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </div>
    </PageShell>
  );
}

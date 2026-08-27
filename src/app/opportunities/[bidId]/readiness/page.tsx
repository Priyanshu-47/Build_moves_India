"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import bidsData from "@/data/bids.json";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";
import { ReadinessChecklist } from "@/components/ReadinessChecklist";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SellerProfile, parseBids } from "@/lib/schemas";
import { computeReadiness } from "@/lib/rules/readiness";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

function readinessColor(score: number): string {
  if (score > 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export default function ReadinessPage() {
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
        <CardSkeleton rows={8} />
      </PageShell>
    );
  }

  if (!bid || !readiness) {
    return (
      <PageShell>
        <PageHeader title="Readiness Check" backUrl="/opportunities" />
        <p className="text-sm text-muted-foreground">Bid not found.</p>
      </PageShell>
    );
  }

  const criticalBlockers = readiness.blockers.filter(
    (blocker) => blocker.severity === "critical"
  );

  return (
    <PageShell>
      <PageHeader
        title="Readiness Check"
        backUrl={`/opportunities/${bid.id}`}
        subtitle={bid.title}
      />

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Readiness score</CardTitle>
          <CardDescription>
            {readiness.readinessScore >= 80
              ? "You are mostly ready to proceed."
              : readiness.readinessScore >= 60
                ? "Some items need attention before bidding."
                : "Several blockers must be resolved first."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              "text-5xl font-bold tabular-nums",
              readinessColor(readiness.readinessScore)
            )}
          >
            {readiness.readinessScore}%
          </p>
        </CardContent>
      </Card>

      {criticalBlockers.length > 0 && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Blockers</CardTitle>
            <CardDescription className="text-red-800">
              Resolve these before submitting your bid.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-red-800">
              {criticalBlockers.map((blocker) => (
                <li key={`${blocker.code}-${blocker.message}`}>• {blocker.message}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Readiness checklist</CardTitle>
          <CardDescription>7 checks for bid participation</CardDescription>
        </CardHeader>
        <CardContent>
          <ReadinessChecklist checks={readiness.checks} />
        </CardContent>
      </Card>

      <Link
        href={`/opportunities/${bid.id}/pricing`}
        className={buttonVariants({ size: "lg", className: "h-11 w-full" })}
      >
        Check Pricing
      </Link>
    </PageShell>
  );
}

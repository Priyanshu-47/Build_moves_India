"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, MapPin, XCircle } from "lucide-react";

import bidsData from "@/data/bids.json";
import { PageShell } from "@/components/PageShell";
import { BidDetailSkeleton } from "@/components/skeletons";
import { MatchScore } from "@/components/MatchScore";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MatchDimensions, SellerProfile, parseBids } from "@/lib/schemas";
import { fallbackExplainMatch } from "@/lib/ai";
import { computeMatch } from "@/lib/rules/match";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

const DIMENSION_LABELS: { key: keyof MatchDimensions; label: string }[] = [
  { key: "product", label: "Product match" },
  { key: "location", label: "Location proximity" },
  { key: "capacity", label: "Capacity fit" },
  { key: "eligibility", label: "Eligibility" },
  { key: "certifications", label: "Certification fit" },
];

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

export default function BidDetailPage() {
  const router = useRouter();
  const params = useParams<{ bidId: string }>();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const bid = useMemo(() => {
    return parseBids(bidsData).find((item) => item.id === params.bidId) ?? null;
  }, [params.bidId]);

  const match = useMemo(() => {
    if (!seller || !bid) return null;
    return computeMatch(seller, bid);
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

  useEffect(() => {
    if (!seller || !bid || !match) return;

    const fallback = fallbackExplainMatch(match, seller, bid);
    let cancelled = false;

    async function fetchExplanation() {
      setAiLoading(true);
      setAiExplanation(null);

      try {
        const response = await fetch("/api/ai/explain-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ matchResult: match, seller, bid }),
        });

        if (!response.ok) throw new Error("Request failed");

        const data = (await response.json()) as { explanation?: string };
        if (!cancelled) {
          setAiExplanation(data.explanation ?? fallback);
        }
      } catch {
        if (!cancelled) {
          setAiExplanation(fallback);
        }
      } finally {
        if (!cancelled) {
          setAiLoading(false);
        }
      }
    }

    fetchExplanation();

    return () => {
      cancelled = true;
    };
  }, [seller, bid, match]);

  if (!ready || !seller) {
    return (
      <PageShell>
        <BidDetailSkeleton />
      </PageShell>
    );
  }

  if (!bid || !match) {
    return (
      <PageShell>
        <Link
          href="/opportunities"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-2" })}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to opportunities
        </Link>
        <p className="text-sm text-muted-foreground">Bid not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Link
        href="/opportunities"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "mb-4 -ml-2" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to opportunities
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{bid.title}</h1>
            {bid.mseReserved && <Badge variant="outline">MSE Reserved</Badge>}
          </div>
          <p className="text-muted-foreground">{bid.department}</p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {bid.location.city}, {bid.location.state}
          </p>
        </div>
        <MatchScore score={match.matchScore} dimensions={match.dimensions} />
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Bid overview</CardTitle>
            <CardDescription>Key tender details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p className="font-medium">
                {bid.quantity.toLocaleString("en-IN")} {bid.unit}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Estimated value</p>
              <p className="font-medium">{formatCurrency(bid.estimatedValue)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Deadline</p>
              <p className="font-medium">{formatDeadline(bid.deadline)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Delivery timeline</p>
              <p className="font-medium">{bid.deliveryDays} days</p>
            </div>
            {bid.emdAmount ? (
              <div>
                <p className="text-muted-foreground">EMD</p>
                <p className="font-medium">{formatCurrency(bid.emdAmount)}</p>
              </div>
            ) : null}
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{bid.categoryPath.join(" › ")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Golden parameters</CardTitle>
            <CardDescription>Technical specifications</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {Object.entries(bid.goldenParameters).map(([key, value]) => (
                <div key={key} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sahayak insight</CardTitle>
            <CardDescription>AI explanation of your match score</CardDescription>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <div className="space-y-2" aria-busy="true" aria-label="Loading explanation">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {aiExplanation}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Match breakdown</CardTitle>
            <CardDescription>How well this bid fits your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {DIMENSION_LABELS.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{match.dimensions[key]}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      match.dimensions[key] > 80
                        ? "bg-green-600"
                        : match.dimensions[key] >= 60
                          ? "bg-yellow-500"
                          : "bg-red-600"
                    )}
                    style={{ width: `${match.dimensions[key]}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {(match.blockers.length > 0 || match.warnings.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle>Blockers & warnings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {match.blockers.map((blocker) => (
                <div
                  key={`${blocker.code}-${blocker.message}`}
                  className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
                  <p>{blocker.message}</p>
                </div>
              ))}
              {match.warnings.map((warning) => (
                <div
                  key={`${warning.code}-${warning.message}`}
                  className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-900"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>{warning.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Link
          href={`/opportunities/${bid.id}/readiness`}
          className={buttonVariants({ size: "lg", className: "h-11 w-full" })}
        >
          Check Readiness
        </Link>
      </div>
    </PageShell>
  );
}

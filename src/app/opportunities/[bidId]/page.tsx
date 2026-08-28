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
        if (!cancelled) setAiExplanation(data.explanation ?? fallback);
      } catch {
        if (!cancelled) setAiExplanation(fallback);
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    }
    fetchExplanation();
    return () => { cancelled = true; };
  }, [seller, bid, match]);

  if (!ready || !seller) {
    return <PageShell><BidDetailSkeleton /></PageShell>;
  }

  if (!bid || !match) {
    return (
      <PageShell>
        <div className="flex items-center gap-2 mb-4">
          <Link href="/opportunities" className="text-xs text-muted-foreground hover:text-foreground">← Back to opportunities</Link>
        </div>
        <p className="text-sm text-muted-foreground">Bid not found.</p>
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-5">
      {/* ── BREADCRUMB + BACK ── */}
      <div>
        <Link href="/opportunities" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-3" />Back to opportunities
        </Link>
      </div>

      {/* ── CLEAN HEADER — no gradient ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {bid.mseReserved && <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">MSE Reserved</Badge>}
            {bid.status === "closing_soon" && <Badge variant="destructive">Closing Soon</Badge>}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">{bid.title}</h1>
          <p className="text-sm text-muted-foreground">{bid.department}</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />{bid.location.city}, {bid.location.state}
          </p>
        </div>
        <MatchScore score={match.matchScore} dimensions={match.dimensions} />
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Quantity", value: `${bid.quantity.toLocaleString("en-IN")} ${bid.unit}` },
          { label: "Estimated value", value: formatCurrency(bid.estimatedValue) },
          { label: "Deadline", value: formatDeadline(bid.deadline) },
          { label: "Delivery", value: `${bid.deliveryDays} days` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-3">
            <p className="text-[10px] font-semibold uppercase text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-sm font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── MATCH BREAKDOWN ── */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-bold">Match breakdown</h2>
        <div className="space-y-3">
          {DIMENSION_LABELS.map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold tabular-nums">{match.dimensions[key]}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    match.dimensions[key] > 80 ? "bg-emerald-500" : match.dimensions[key] >= 60 ? "bg-amber-500" : "bg-red-500"
                  )}
                  style={{ width: `${match.dimensions[key]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── GOLDEN PARAMETERS ── */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 text-sm font-bold">Golden parameters</h2>
        <dl className="space-y-2 text-xs">
          {Object.entries(bid.goldenParameters).map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-4 border-b border-dashed border-border/50 pb-2 last:border-0">
              <dt className="text-muted-foreground">{key}</dt>
              <dd className="font-semibold text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── BLOCKERS & WARNINGS ── */}
      {(match.blockers.length > 0 || match.warnings.length > 0) && (
        <div className="rounded-xl border bg-card p-5">
          <h2 className="mb-3 text-sm font-bold">Blockers & warnings</h2>
          <div className="space-y-2">
            {match.blockers.map((blocker) => (
              <div key={`${blocker.code}-${blocker.message}`} className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <XCircle className="mt-0.5 size-3.5 shrink-0 text-red-600" />{blocker.message}
              </div>
            ))}
            {match.warnings.map((warning) => (
              <div key={`${warning.code}-${warning.message}`} className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />{warning.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI INSIGHT ── */}
      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-3 text-sm font-bold">Sahayak insight</h2>
        {aiLoading ? (
          <div className="space-y-2" aria-busy="true">
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/6 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">{aiExplanation}</p>
        )}
      </div>

      {/* ── CTA ── */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/simulate?bid=${bid.id}`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-4 text-sm font-semibold transition-all hover:bg-muted/50"
        >
          Simulate bid
        </Link>
        <Link
          href={`/opportunities/${bid.id}/readiness`}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl gradient-cta px-4 text-sm font-semibold text-white"
        >
          Check Readiness
        </Link>
      </div>
    </PageShell>
  );
}

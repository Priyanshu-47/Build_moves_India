"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  IndianRupee,
  Lightbulb,
  MapPin,
  Package,
  ShieldAlert,
  Sparkles,
  Truck,
  XCircle,
} from "lucide-react";

import bidsData from "@/data/bids.json";
import { PageShell } from "@/components/PageShell";
import { BidDetailSkeleton } from "@/components/skeletons";
import { MatchScore } from "@/components/MatchScore";
import { MatchDimensions, SellerProfile, parseBids } from "@/lib/schemas";
import { fallbackExplainMatch } from "@/lib/ai";
import { computeMatch } from "@/lib/rules/match";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

const DIMENSION_LABELS: { key: keyof MatchDimensions; label: string }[] = [
  { key: "product", label: "Product match" },
  { key: "location", label: "Location proximity" },
  { key: "capacity", label: "Capacity fit" },
  { key: "eligibility", label: "Past performance" },
  { key: "certifications", label: "Certificate match" },
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

function barColor(value: number): string {
  if (value > 80) return "bg-emerald-500";
  if (value >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

function buildRecommendations(
  blockers: { message: string }[],
  warnings: { message: string }[]
): string[] {
  const tips: string[] = [];
  const haystack = [...blockers, ...warnings].map((b) => b.message.toLowerCase());

  if (haystack.some((m) => m.includes("capacity"))) {
    tips.push("Increase monthly capacity to meet requirement.");
  }
  if (haystack.some((m) => m.includes("caution"))) {
    tips.push("Deposit caution money to proceed.");
  }
  if (haystack.some((m) => m.includes("bis") || m.includes("certificate"))) {
    tips.push("Upload BIS certificate for this category.");
  }
  if (haystack.some((m) => m.includes("location") || m.includes("far"))) {
    tips.push("Prefer local tenders or factor higher freight.");
  }
  if (tips.length === 0) {
    tips.push("Review golden parameters before preparing your bid.");
    tips.push("Run a true-cost simulation before submitting.");
  }
  return tips.slice(0, 3);
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
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" aria-hidden="true" />
          Back to opportunities
        </Link>
        <p className="mt-4 text-sm text-muted-foreground">Bid not found.</p>
      </PageShell>
    );
  }

  const recommendations = buildRecommendations(match.blockers, match.warnings);

  return (
    <PageShell className="pb-10">
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3" aria-hidden="true" />
        Back to opportunities
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            Bid details
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            {bid.title}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {bid.department}
            <span className="text-muted-foreground/50">·</span>
            {bid.location.city}, {bid.location.state}
          </p>
        </div>
        <MatchScore score={match.matchScore} dimensions={match.dimensions} />
      </div>

      {/* Stat strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Quantity",
            value: `${bid.quantity.toLocaleString("en-IN")} ${bid.unit}`,
            icon: Package,
          },
          {
            label: "Estimated value",
            value: formatCurrency(bid.estimatedValue),
            icon: IndianRupee,
          },
          {
            label: "Deadline",
            value: formatDeadline(bid.deadline),
            icon: Calendar,
          },
          {
            label: "Delivery",
            value: `${bid.deliveryDays} days`,
            icon: Truck,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border bg-card px-4 py-3.5 shadow-sm"
          >
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Icon className="size-3.5 text-primary" aria-hidden="true" />
              {label}
            </div>
            <p className="text-sm font-bold tabular-nums text-foreground sm:text-base">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Match + Golden params */}
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">Match breakdown</h2>
          </div>
          <div className="space-y-4">
            {DIMENSION_LABELS.map(({ key, label }) => (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-bold tabular-nums text-foreground">
                    {match.dimensions[key]}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      barColor(match.dimensions[key])
                    )}
                    style={{ width: `${match.dimensions[key]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">Golden parameters</h2>
          </div>
          <dl className="divide-y">
            {Object.entries(bid.goldenParameters).map(([key, value]) => (
              <div
                key={key}
                className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <dt className="text-sm text-muted-foreground">{key}</dt>
                <dd className="text-right text-sm font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Blockers + Insight */}
      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <ShieldAlert className="size-4 text-rose-500" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">Blockers &amp; warnings</h2>
          </div>
          {match.blockers.length === 0 && match.warnings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No blockers or warnings for this tender.</p>
          ) : (
            <div className="space-y-2.5">
              {match.blockers.map((blocker) => (
                <div
                  key={`${blocker.code}-${blocker.message}`}
                  className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"
                >
                  <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden="true" />
                  {blocker.message}
                </div>
              ))}
              {match.warnings.map((warning) => (
                <div
                  key={`${warning.code}-${warning.message}`}
                  className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  {warning.message}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="size-4 text-sky-500" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">Sahayak insight</h2>
          </div>
          {aiLoading ? (
            <div className="space-y-2" aria-busy="true">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/6 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">{aiExplanation}</p>
          )}

          <div className="mt-5">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Recommendations
            </p>
            <ul className="space-y-2">
              {recommendations.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* CTAs */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/simulate?bid=${bid.id}`}
          className="inline-flex h-11 items-center justify-center rounded-full border bg-card px-6 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/50"
        >
          Simulate bid
        </Link>
        <Link
          href={`/opportunities/${bid.id}/readiness`}
          className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          Check Readiness
        </Link>
      </div>
    </PageShell>
  );
}

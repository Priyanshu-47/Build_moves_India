"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import bidsData from "@/data/bids.json";
import { BidAlertsPanel } from "@/components/BidAlertsPanel";
import { PageShell } from "@/components/PageShell";
import { BidCard } from "@/components/BidCard";
import { OpportunitiesSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SellerProfile, parseBids } from "@/lib/schemas";
import { rankBids } from "@/lib/rules/match";
import { getSeller } from "@/lib/store";

type ViewMode = "bids" | "alerts";
type BidTabValue = "all" | "top" | "closing";

export function OpportunitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [bidTab, setBidTab] = useState<BidTabValue>("all");

  const view: ViewMode =
    searchParams.get("view") === "alerts" ? "alerts" : "bids";

  useEffect(() => {
    const profile = getSeller();
    if (!profile) {
      router.replace("/setup");
      return;
    }
    setSeller(profile);
    setReady(true);
  }, [router]);

  const rankedBids = useMemo(() => {
    if (!seller) return [];
    return rankBids(seller, parseBids(bidsData));
  }, [seller]);

  const filteredBids = useMemo(() => {
    switch (bidTab) {
      case "top":
        return rankedBids.filter(({ match }) => match.pursue);
      case "closing":
        return rankedBids.filter(({ bid }) => bid.status === "closing_soon");
      default:
        return rankedBids;
    }
  }, [rankedBids, bidTab]);

  const pursueCount = rankedBids.filter(({ match }) => match.pursue).length;

  function setView(next: ViewMode) {
    if (next === "alerts") {
      router.replace("/opportunities?view=alerts");
    } else {
      router.replace("/opportunities");
    }
  }

  if (!ready || !seller) {
    return (
      <PageShell>
        <PageHeaderSkeleton />
        <OpportunitiesSkeleton />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-4 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Opportunities</h1>
        <p className="text-sm text-muted-foreground">
          {view === "bids"
            ? `${rankedBids.length} tenders found · ${pursueCount} worth pursuing for ${seller.businessName}`
            : `Bid alerts for ${seller.businessName}`}
        </p>
      </div>

      <Tabs
        value={view}
        onValueChange={(value) => setView(value as ViewMode)}
        className="mb-4 w-full"
      >
        <TabsList className="grid h-9 w-full grid-cols-2">
          <TabsTrigger value="bids" className="text-xs sm:text-sm">
            Tenders
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs sm:text-sm">
            Alerts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "bids" ? (
        <>
          <Tabs
            value={bidTab}
            onValueChange={(value) => setBidTab(value as BidTabValue)}
            className="mb-4 w-full"
          >
            <TabsList className="grid h-9 w-full grid-cols-3">
              <TabsTrigger value="all" className="text-xs sm:text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="top" className="text-xs sm:text-sm">
                Top Matches
              </TabsTrigger>
              <TabsTrigger value="closing" className="text-xs sm:text-sm">
                Closing Soon
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {filteredBids.length > 0 ? (
              filteredBids.map(({ bid, match }) => (
                <BidCard key={bid.id} bid={bid} match={match} />
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No tenders in this category.
              </p>
            )}
          </div>
        </>
      ) : (
        <BidAlertsPanel />
      )}
    </PageShell>
  );
}

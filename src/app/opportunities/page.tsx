"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import bidsData from "@/data/bids.json";
import { PageShell } from "@/components/PageShell";
import { BidCard } from "@/components/BidCard";
import { OpportunitiesSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SellerProfile, parseBids } from "@/lib/schemas";
import { rankBids } from "@/lib/rules/match";
import { getSeller } from "@/lib/store";

type TabValue = "all" | "top" | "closing";

export default function OpportunitiesPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<TabValue>("all");

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
    switch (tab) {
      case "top":
        return rankedBids.filter(({ match }) => match.pursue);
      case "closing":
        return rankedBids.filter(({ bid }) => bid.status === "closing_soon");
      default:
        return rankedBids;
    }
  }, [rankedBids, tab]);

  const pursueCount = rankedBids.filter(({ match }) => match.pursue).length;

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
          {rankedBids.length} tenders found · {pursueCount} worth pursuing for{" "}
          {seller.businessName}
        </p>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as TabValue)}
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
    </PageShell>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, SearchX } from "lucide-react";

import bidsData from "@/data/bids.json";
import { BidAlertsPanel } from "@/components/BidAlertsPanel";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { BidCard } from "@/components/BidCard";
import { OpportunitiesSkeleton, PageHeaderSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChips } from "@/components/ui/filter-chips";
import { SearchBar } from "@/components/ui/search-bar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SellerProfile, parseBids } from "@/lib/schemas";
import { rankBids } from "@/lib/rules/match";
import {
  ActiveFilters,
  SortOption,
  buildFilterGroups,
  buildSearchSuggestions,
  filterRankedBids,
  getDidYouMean,
  hasActiveFilters,
  removeFilter,
  sortRankedBids,
  toggleFilter,
} from "@/lib/rules/opportunity-filters";
import { getSeller } from "@/lib/store";

type ViewMode = "bids" | "alerts";
type BidTabValue = "all" | "top" | "closing";

const bids = parseBids(bidsData);

export function OpportunitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [bidTab, setBidTab] = useState<BidTabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>("match");

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
    return rankBids(seller, bids);
  }, [seller]);

  const tabbedBids = useMemo(() => {
    switch (bidTab) {
      case "top":
        return rankedBids.filter(({ match }) => match.pursue);
      case "closing":
        return rankedBids.filter(({ bid }) => bid.status === "closing_soon");
      default:
        return rankedBids;
    }
  }, [rankedBids, bidTab]);

  const filteredBids = useMemo(() => {
    const filtered = filterRankedBids(tabbedBids, searchQuery, activeFilters);
    return sortRankedBids(filtered, sortBy);
  }, [tabbedBids, searchQuery, activeFilters, sortBy]);

  const searchSuggestions = useMemo(() => buildSearchSuggestions(bids), []);
  const filterGroups = useMemo(() => buildFilterGroups(bids), []);

  const didYouMean = useMemo(() => {
    if (!searchQuery.trim() || filteredBids.length > 0) return null;
    return getDidYouMean(searchQuery, searchSuggestions);
  }, [searchQuery, filteredBids.length, searchSuggestions]);

  const pursueCount = rankedBids.filter(({ match }) => match.pursue).length;
  const filtersActive = hasActiveFilters(activeFilters, searchQuery);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelect = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  function setView(next: ViewMode) {
    if (next === "alerts") {
      router.replace("/opportunities?view=alerts");
    } else {
      router.replace("/opportunities");
    }
  }

  function clearAllFilters() {
    setSearchQuery("");
    setActiveFilters({});
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
      <PageHeader
        title="Find Tenders"
        backUrl="/"
        subtitle={
          view === "bids"
            ? `${filteredBids.length} of ${rankedBids.length} tenders · ${pursueCount} worth pursuing for ${seller.businessName}`
            : `Bid alerts for ${seller.businessName}`
        }
      />

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
          <div className="mb-4 space-y-3">
            <SearchBar
              placeholder="Search by title, department, or HSN code"
              suggestions={searchSuggestions}
              value={searchQuery}
              onSearch={handleSearch}
              onSelect={handleSelect}
              didYouMean={didYouMean}
            />

            <FilterChips
              filters={filterGroups}
              activeFilters={activeFilters}
              onFilterChange={(key, value) =>
                setActiveFilters((current) => toggleFilter(current, key, value))
              }
              onClearFilter={(key, value) =>
                setActiveFilters((current) => removeFilter(current, key, value))
              }
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="match">Match score</option>
                  <option value="deadline">Deadline</option>
                  <option value="value">Estimated value</option>
                </select>
              </label>
              {filtersActive && (
                <Button type="button" variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          </div>

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

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredBids.length > 0 ? (
              filteredBids.map(({ bid, match }) => (
                <BidCard key={bid.id} bid={bid} match={match} />
              ))
            ) : filtersActive ? (
              <EmptyState
                icon={SearchX}
                title="No tenders match your search"
                description="No tenders match. Try broadening your product list or expanding your delivery radius."
                actions={[
                  { label: "Clear all filters", onClick: clearAllFilters, variant: "outline" },
                  { label: "Update profile", action: "/setup" },
                  { label: "Simulate a bid", action: "/simulate" },
                ]}
              />
            ) : tabbedBids.length === 0 && bidTab !== "all" ? (
              <EmptyState
                icon={Briefcase}
                title={
                  bidTab === "top" ? "No top matches yet" : "No tenders closing soon"
                }
                description={
                  bidTab === "top"
                    ? "None of the open tenders score high enough to pursue. Update your profile or catalogue to improve matches."
                    : "No tenders are closing in the next few days. Check back later or browse all tenders."
                }
                actions={[
                  { label: "View all tenders", onClick: () => setBidTab("all"), variant: "outline" },
                  { label: "Update profile", action: "/setup" },
                ]}
              />
            ) : (
              <EmptyState
                icon={Briefcase}
                title="No matching tenders"
                description="No matching tenders. Update your profile to improve matches."
                actions={[
                  { label: "Update profile", action: "/setup" },
                  { label: "Add products", action: "/catalogue" },
                ]}
              />
            )}
          </div>
        </>
      ) : (
        <BidAlertsPanel />
      )}
    </PageShell>
  );
}

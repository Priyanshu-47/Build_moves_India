"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bell, Briefcase, SearchX, Target, Timer } from "lucide-react";

import bidsData from "@/data/bids.json";
import { BidAlertsPanel } from "@/components/BidAlertsPanel";
import { PageShell } from "@/components/PageShell";
import { PullToRefresh } from "@/components/PullToRefresh";
import { BidCard } from "@/components/BidCard";
import { OpportunitiesSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterChips } from "@/components/ui/filter-chips";
import { SearchBar } from "@/components/ui/search-bar";
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
import { cn } from "@/lib/utils";

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
  const closingCount = rankedBids.filter(
    ({ bid }) => bid.status === "closing_soon"
  ).length;
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
      <PageShell wide>
        <OpportunitiesSkeleton />
      </PageShell>
    );
  }

  return (
    <PullToRefresh
      onRefresh={async () => {
        setReady(false);
        await new Promise((r) => setTimeout(r, 400));
        setReady(true);
      }}
    >
      <PageShell wide className="space-y-6">
        {/* ── PAGE HEADER ── */}
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Tender discovery</p>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Find tenders that fit</h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                Ranked for {seller.businessName} — match score, deadlines, eligibility.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <span className="rounded-xl bg-muted px-3 py-2 text-xs font-semibold">
                <strong>{filteredBids.length}</strong> tenders
              </span>
              <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                {pursueCount} worth pursuing
              </span>
              {closingCount > 0 && (
                <span className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                  {closingCount} closing soon
                </span>
              )}
            </div>
          </div>

          {/* Tabs inside header card */}
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t pt-5">
            <button onClick={() => setView("bids")} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-all", view === "bids" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
              <Target className="mr-1.5 inline size-3.5" />Tenders
            </button>
            <button onClick={() => setView("alerts")} className={cn("rounded-full px-4 py-2 text-sm font-semibold transition-all", view === "alerts" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
              <Bell className="mr-1.5 inline size-3.5" />Alerts
            </button>
          </div>
        </section>

        {view === "bids" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">Filters</p>
                {filtersActive && (
                  <button onClick={clearAllFilters} className="text-xs font-semibold text-primary hover:underline">Clear All</button>
                )}
              </div>

              <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Search</p>
                <SearchBar
                  placeholder="Title, department, HSN…"
                  suggestions={searchSuggestions}
                  value={searchQuery}
                  onSearch={handleSearch}
                  onSelect={handleSelect}
                  didYouMean={didYouMean}
                />
              </div>

              <FilterChips
                filters={filterGroups}
                activeFilters={activeFilters}
                onFilterChange={(key, value) => setActiveFilters((current) => toggleFilter(current, key, value))}
                onClearFilter={(key, value) => setActiveFilters((current) => removeFilter(current, key, value))}
              />

              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Sort by</p>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring/50"
                >
                  <option value="match">Match score</option>
                  <option value="deadline">Deadline</option>
                  <option value="value">Estimated value</option>
                </select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Quick filter</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: "all" as BidTabValue, label: "All", count: rankedBids.length },
                    { key: "top" as BidTabValue, label: "Top", count: pursueCount },
                    { key: "closing" as BidTabValue, label: "Soon", count: closingCount },
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setBidTab(key)}
                      className={cn(
                        "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                        bidTab === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {key === "closing" && <Timer className="mr-1 inline size-3" />}{label} ({count})
                    </button>
                  ))}
                </div>
              </div>
              </div>
            </aside>

            <div className="min-w-0 space-y-4">
              {filteredBids.length > 0 ? (
                filteredBids.map(({ bid, match }) => (
                  <BidCard key={bid.id} bid={bid} match={match} />
                ))
              ) : filtersActive ? (
                <EmptyState
                  icon={SearchX}
                  title="No tenders match your search"
                  description="Try broadening your product list or expanding your delivery radius."
                  actions={[
                    { label: "Clear all filters", onClick: clearAllFilters, variant: "outline" },
                    { label: "Update profile", action: "/setup" },
                  ]}
                />
              ) : (
                <EmptyState
                  icon={Briefcase}
                  title={bidTab === "top" ? "No top matches yet" : bidTab === "closing" ? "No tenders closing soon" : "No matching tenders"}
                  description="Update your profile to improve match scores."
                  actions={[
                    { label: "Update profile", action: "/setup" },
                    { label: "Add products", action: "/catalogue" },
                  ]}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <BidAlertsPanel />
          </div>
        )}
      </PageShell>
    </PullToRefresh>
  );
}

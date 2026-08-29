"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Bookmark,
  Briefcase,
  RefreshCw,
  SearchX,
  Target,
  Timer,
} from "lucide-react";

import bidsData from "@/data/bids.json";
import { BidAlertsPanel } from "@/components/BidAlertsPanel";
import { BidCard } from "@/components/BidCard";
import { PageShell } from "@/components/PageShell";
import { PullToRefresh } from "@/components/PullToRefresh";
import { TenderDiscoveryHeroArt } from "@/components/TenderDiscoveryHeroArt";
import { OpportunitiesSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/ui/empty-state";
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
  sortRankedBids,
  toggleFilter,
} from "@/lib/rules/opportunity-filters";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

type ViewMode = "bids" | "alerts";
type BidTabValue = "all" | "top" | "closing";

const bids = parseBids(bidsData);
const STATE_PREVIEW = 3;

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold transition",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function OpportunitiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [bidTab, setBidTab] = useState<BidTabValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>("match");
  const [showAllStates, setShowAllStates] = useState(false);
  const [filtersSaved, setFiltersSaved] = useState(false);

  const view: ViewMode = searchParams.get("view") === "alerts" ? "alerts" : "bids";

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
    setFiltersSaved(false);
  }, []);

  const handleSelect = useCallback((value: string) => {
    setSearchQuery(value);
    setFiltersSaved(false);
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
    setBidTab("all");
    setFiltersSaved(false);
  }

  function handleToggleFilter(key: string, value: string) {
    setActiveFilters((current) => toggleFilter(current, key, value));
    setFiltersSaved(false);
  }

  function handleSaveFilters() {
    try {
      localStorage.setItem(
        "sahayak-opportunity-filters",
        JSON.stringify({ searchQuery, activeFilters, sortBy, bidTab })
      );
      setFiltersSaved(true);
    } catch {
      setFiltersSaved(false);
    }
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sahayak-opportunity-filters");
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        searchQuery?: string;
        activeFilters?: ActiveFilters;
        sortBy?: SortOption;
        bidTab?: BidTabValue;
      };
      if (saved.searchQuery) setSearchQuery(saved.searchQuery);
      if (saved.activeFilters) setActiveFilters(saved.activeFilters);
      if (saved.sortBy) setSortBy(saved.sortBy);
      if (saved.bidTab) setBidTab(saved.bidTab);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  if (!ready || !seller) {
    return (
      <PageShell wide>
        <OpportunitiesSkeleton />
      </PageShell>
    );
  }

  const stateGroup = filterGroups.find((g) => g.key === "state");
  const otherGroups = filterGroups.filter((g) => g.key !== "state");
  const visibleStates = showAllStates
    ? stateGroup?.options ?? []
    : (stateGroup?.options ?? []).slice(0, STATE_PREVIEW);
  const hiddenStateCount = Math.max(
    0,
    (stateGroup?.options.length ?? 0) - STATE_PREVIEW
  );

  return (
    <PullToRefresh
      onRefresh={async () => {
        setReady(false);
        await new Promise((r) => setTimeout(r, 400));
        setReady(true);
      }}
    >
      <PageShell wide className="pb-10">
        {/* Hero — open layout + illustration */}
        <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-violet-50/90 via-background to-indigo-50/70 px-5 py-6 sm:px-8 sm:py-8 dark:from-violet-950/25 dark:via-background dark:to-indigo-950/20">
          <TenderDiscoveryHeroArt className="pointer-events-none absolute bottom-0 right-0 hidden h-[170px] w-[230px] opacity-95 md:block lg:right-4 lg:h-[190px] lg:w-[260px]" />

          <div className="relative z-[1] flex flex-col gap-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 space-y-1.5 lg:max-w-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  Tender discovery
                </p>
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                  Find tenders that fit
                </h1>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Ranked for {seller.businessName} — match score, deadlines, eligibility.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <span className="inline-flex h-8 items-center rounded-full border bg-card/90 px-3 text-xs font-semibold shadow-sm backdrop-blur">
                  <strong className="mr-1 tabular-nums">{filteredBids.length}</strong> Tenders
                </span>
                <span className="inline-flex h-8 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <strong className="mr-1 tabular-nums">{pursueCount}</strong> Worth pursuing
                </span>
                {closingCount > 0 && (
                  <span className="inline-flex h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 shadow-sm dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
                    <strong className="mr-1 tabular-nums">{closingCount}</strong> Closing soon
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setView("bids")}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-semibold transition",
                  view === "bids"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                )}
              >
                <Target className="size-3.5" aria-hidden="true" />
                Tenders
              </button>
              <button
                type="button"
                onClick={() => setView("alerts")}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-full px-5 text-sm font-semibold transition",
                  view === "alerts"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                )}
              >
                <Bell className="size-3.5" aria-hidden="true" />
                Alerts
              </button>
            </div>
          </div>
        </section>

        {view === "bids" ? (
          <div className="mt-7 grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr]">
            {/* Filters sidebar */}
            <aside className="rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
              <div className="mb-5 flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-foreground">Filters</h2>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  disabled={!filtersActive && bidTab === "all"}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RefreshCw className="size-3" aria-hidden="true" />
                  Reset
                </button>
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

                {/* State */}
                {stateGroup && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">{stateGroup.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {visibleStates.map((option) => {
                        const active =
                          activeFilters.state?.includes(option.value) ?? false;
                        return (
                          <Chip
                            key={option.value}
                            active={active}
                            onClick={() => handleToggleFilter("state", option.value)}
                          >
                            {option.label}
                          </Chip>
                        );
                      })}
                      {!showAllStates && hiddenStateCount > 0 && (
                        <Chip active={false} onClick={() => setShowAllStates(true)}>
                          +{hiddenStateCount}
                        </Chip>
                      )}
                      {showAllStates && hiddenStateCount > 0 && (
                        <Chip active={false} onClick={() => setShowAllStates(false)}>
                          Less
                        </Chip>
                      )}
                    </div>
                  </div>
                )}

                {/* Other filter groups */}
                {otherGroups.map((group) => (
                  <div key={group.key} className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">{group.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.options.map((option) => {
                        const active =
                          activeFilters[group.key]?.includes(option.value) ?? false;
                        return (
                          <Chip
                            key={`${group.key}-${option.value}`}
                            active={active}
                            onClick={() => handleToggleFilter(group.key, option.value)}
                          >
                            {option.label}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">Sort by</p>
                  <select
                    value={sortBy}
                    onChange={(event) => {
                      setSortBy(event.target.value as SortOption);
                      setFiltersSaved(false);
                    }}
                    className="h-10 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    <option value="match">Match score</option>
                    <option value="deadline">Deadline</option>
                    <option value="value">Estimated value</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">Quick filters</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        { key: "all" as BidTabValue, label: "All", count: rankedBids.length },
                        { key: "top" as BidTabValue, label: "Top", count: pursueCount },
                        {
                          key: "closing" as BidTabValue,
                          label: "Soon",
                          count: closingCount,
                        },
                      ] as const
                    ).map(({ key, label, count }) => (
                      <Chip key={key} active={bidTab === key} onClick={() => setBidTab(key)}>
                        {key === "closing" && (
                          <Timer className="mr-1 size-3" aria-hidden="true" />
                        )}
                        {label} ({count})
                      </Chip>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveFilters}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border bg-background text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <Bookmark
                    className={cn("size-3.5", filtersSaved && "fill-primary text-primary")}
                    aria-hidden="true"
                  />
                  {filtersSaved ? "Filters saved" : "Save filters"}
                </button>
              </div>
            </aside>

            {/* Tender list */}
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
                  title={
                    bidTab === "top"
                      ? "No top matches yet"
                      : bidTab === "closing"
                        ? "No tenders closing soon"
                        : "No matching tenders"
                  }
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
          <div className="mt-7 rounded-2xl border bg-card p-6 shadow-sm">
            <BidAlertsPanel />
          </div>
        )}
      </PageShell>
    </PullToRefresh>
  );
}

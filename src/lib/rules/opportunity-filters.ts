import hsnData from "@/data/hsn-codes.json";
import { BidOpportunity, MatchResult } from "@/lib/schemas";
import { getToday } from "@/lib/rules/msme-rights";

export type SortOption = "match" | "deadline" | "value";

export type ActiveFilters = Record<string, string[]>;

export type RankedBid = {
  bid: BidOpportunity;
  match: MatchResult;
};

const HSN_BY_CATEGORY = new Map<string, string>();

for (const category of hsnData.categories) {
  const leaf = category.categoryPath[category.categoryPath.length - 1]?.toLowerCase() ?? "";
  HSN_BY_CATEGORY.set(leaf, category.hsnCode);
  for (const name of category.productNames) {
    HSN_BY_CATEGORY.set(name.toLowerCase(), category.hsnCode);
  }
}

function daysUntilDeadline(deadline: string): number {
  const end = new Date(`${deadline}T23:59:59`);
  const now = new Date(`${getToday()}T12:00:00`);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getBidHsn(bid: BidOpportunity): string {
  const leaf = bid.categoryPath[bid.categoryPath.length - 1] ?? "";
  return HSN_BY_CATEGORY.get(leaf.toLowerCase()) ?? "";
}

export function buildSearchSuggestions(bids: BidOpportunity[]): string[] {
  const items = new Set<string>();
  for (const bid of bids) {
    items.add(bid.title);
    items.add(bid.department);
    items.add(bid.location.state);
    items.add(bid.location.city);
    const hsn = getBidHsn(bid);
    if (hsn) items.add(hsn);
  }
  return [...items].sort();
}

function levenshtein(a: string, b: string): number {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

export function getDidYouMean(query: string, suggestions: string[]): string | null {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 3) return null;

  let best: { text: string; distance: number } | null = null;
  for (const suggestion of suggestions) {
    const distance = levenshtein(normalized, suggestion.toLowerCase());
    if (distance === 0 || distance > 3) continue;
    if (!best || distance < best.distance) {
      best = { text: suggestion, distance };
    }
  }
  return best?.text ?? null;
}

function matchesSearch(bid: BidOpportunity, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const hsn = getBidHsn(bid);
  const haystack = [
    bid.title,
    bid.department,
    bid.location.state,
    bid.location.city,
    hsn,
    ...bid.categoryPath,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

function matchesValueRange(value: number, range: string): boolean {
  switch (range) {
    case "0-5":
      return value < 500_000;
    case "5-20":
      return value >= 500_000 && value < 2_000_000;
    case "20+":
      return value >= 2_000_000;
    default:
      return true;
  }
}

function matchesClosingWithin(deadline: string, withinDays: string): boolean {
  const days = daysUntilDeadline(deadline);
  const limit = Number.parseInt(withinDays, 10);
  return days >= 0 && days <= limit;
}

export function filterRankedBids(
  ranked: RankedBid[],
  searchQuery: string,
  activeFilters: ActiveFilters
): RankedBid[] {
  return ranked.filter(({ bid }) => {
    if (!matchesSearch(bid, searchQuery)) return false;

    const states = activeFilters.state ?? [];
    if (states.length > 0 && !states.includes(bid.location.state)) return false;

    const valueRanges = activeFilters.valueRange ?? [];
    if (valueRanges.length > 0 && !valueRanges.some((range) => matchesValueRange(bid.estimatedValue, range))) {
      return false;
    }

    const mseFilters = activeFilters.mseReserved ?? [];
    if (mseFilters.includes("yes") && !bid.mseReserved) return false;

    const closingFilters = activeFilters.closingWithin ?? [];
    if (
      closingFilters.length > 0 &&
      !closingFilters.some((days) => matchesClosingWithin(bid.deadline, days))
    ) {
      return false;
    }

    return true;
  });
}

export function sortRankedBids(ranked: RankedBid[], sortBy: SortOption): RankedBid[] {
  const sorted = [...ranked];
  switch (sortBy) {
    case "deadline":
      return sorted.sort(
        (a, b) => new Date(a.bid.deadline).getTime() - new Date(b.bid.deadline).getTime()
      );
    case "value":
      return sorted.sort((a, b) => b.bid.estimatedValue - a.bid.estimatedValue);
    default:
      return sorted.sort((a, b) => b.match.matchScore - a.match.matchScore);
  }
}

export function buildFilterGroups(bids: BidOpportunity[]): {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}[] {
  const states = [...new Set(bids.map((bid) => bid.location.state))].sort();

  return [
    {
      key: "state",
      label: "State",
      options: states.map((state) => ({ value: state, label: state })),
    },
    {
      key: "valueRange",
      label: "Value",
      options: [
        { value: "0-5", label: "0–5L" },
        { value: "5-20", label: "5–20L" },
        { value: "20+", label: "20L+" },
      ],
    },
    {
      key: "mseReserved",
      label: "MSE",
      options: [{ value: "yes", label: "MSE Reserved" }],
    },
    {
      key: "closingWithin",
      label: "Closing",
      options: [
        { value: "7", label: "7 days" },
        { value: "14", label: "14 days" },
        { value: "30", label: "30 days" },
      ],
    },
  ];
}

export function toggleFilter(
  active: ActiveFilters,
  key: string,
  value: string
): ActiveFilters {
  const current = active[key] ?? [];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
  return { ...active, [key]: next };
}

export function removeFilter(
  active: ActiveFilters,
  key: string,
  value: string
): ActiveFilters {
  const current = active[key] ?? [];
  const next = current.filter((item) => item !== value);
  if (next.length === 0) {
    const { [key]: _, ...rest } = active;
    return rest;
  }
  return { ...active, [key]: next };
}

export function hasActiveFilters(active: ActiveFilters, searchQuery: string): boolean {
  return (
    searchQuery.trim().length > 0 ||
    Object.values(active).some((values) => values.length > 0)
  );
}

import {
  BidOpportunity,
  ComparablePurchase,
  PriceIntelligence,
  SellerProfile,
} from "@/lib/schemas";

const COST_RATIO = 0.82;
const COMPETITIVE_BUFFER = 0.03;

function categoryLeaf(categoryPath: string[]): string {
  return categoryPath[categoryPath.length - 1] ?? "";
}

function sameCategory(bid: BidOpportunity, comparable: ComparablePurchase): boolean {
  return categoryLeaf(bid.categoryPath) === categoryLeaf(comparable.categoryPath);
}

function quantityWithinRange(bidQuantity: number, comparableQuantity: number): boolean {
  return (
    comparableQuantity >= bidQuantity / 2 && comparableQuantity <= bidQuantity * 2
  );
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function roundCurrency(value: number): number {
  return Math.round(value);
}

function buildGuidance(
  bid: BidOpportunity,
  comparables: ComparablePurchase[],
  recommendedRange: { low: number; high: number },
  comparableRange: { min: number; max: number }
): string {
  if (comparables.length === 0) {
    return `No direct comparables found. Estimated unit price is ₹${roundCurrency(bid.estimatedValue / bid.quantity).toLocaleString("en-IN")}. Consider bidding between ₹${recommendedRange.low.toLocaleString("en-IN")} and ₹${recommendedRange.high.toLocaleString("en-IN")} per unit.`;
  }

  return `Based on ${comparables.length} similar government purchase${comparables.length > 1 ? "s" : ""}, award prices ranged from ₹${comparableRange.min.toLocaleString("en-IN")} to ₹${comparableRange.max.toLocaleString("en-IN")} per unit. A competitive bid of ₹${recommendedRange.low.toLocaleString("en-IN")}–₹${recommendedRange.high.toLocaleString("en-IN")} per unit balances winning probability with healthy margin.`;
}

export function findComparables(
  bid: BidOpportunity,
  allComparables: ComparablePurchase[]
): ComparablePurchase[] {
  return allComparables.filter(
    (comparable) =>
      sameCategory(bid, comparable) &&
      quantityWithinRange(bid.quantity, comparable.quantity)
  );
}

export function computePriceIntelligence(
  bid: BidOpportunity,
  _seller: SellerProfile,
  allComparables: ComparablePurchase[]
): PriceIntelligence {
  const comparables = findComparables(bid, allComparables);

  let prices: number[];
  if (comparables.length > 0) {
    prices = comparables.map((comparable) => comparable.awardedPrice);
  } else {
    const unitEstimate = bid.estimatedValue / bid.quantity;
    prices = [unitEstimate * 0.97, unitEstimate, unitEstimate * 1.03];
  }

  const min = roundCurrency(Math.min(...prices));
  const max = roundCurrency(Math.max(...prices));
  const med = roundCurrency(median(prices));

  const recommendedLow = roundCurrency(med * (1 - COMPETITIVE_BUFFER));
  const recommendedHigh = roundCurrency(med * (1 + COMPETITIVE_BUFFER));
  const recommendedMid = (recommendedLow + recommendedHigh) / 2;

  const costBasis = recommendedMid * COST_RATIO;
  const marginAmount = roundCurrency(recommendedMid - costBasis);
  const marginPercent = roundCurrency((marginAmount / recommendedMid) * 100);

  const comparableRange = { min, max, currency: "INR" as const };
  const recommendedRange = { low: recommendedLow, high: recommendedHigh };

  return {
    bidId: bid.id,
    comparableRange,
    recommendedRange,
    estimatedMargin: {
      amount: marginAmount,
      percent: marginPercent,
    },
    comparables,
    guidance: buildGuidance(bid, comparables, recommendedRange, comparableRange),
  };
}

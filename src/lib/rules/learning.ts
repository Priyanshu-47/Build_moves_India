import bidHistoryData from "@/data/bid-history.json";
import { getAccountBids } from "@/lib/demo-data";
import { BidOpportunity, SellerProfile } from "@/lib/schemas";

export type BidResult = "won" | "lost";

export type BidHistoryEntry = {
  bidId: string;
  title: string;
  result: BidResult;
  margin: number | null;
  reason: string;
  category: string;
  distance: number;
  bidValue: number;
  mseReserved: boolean;
  bidDate: string;
};

export type WinPatternAnalysis = {
  wins: {
    count: number;
    avgMargin: number;
    commonFactors: string[];
  };
  losses: {
    count: number;
    commonReasons: string[];
  };
  insights: string[];
  recommendations: string[];
};

export type LossReasonBreakdown = {
  reason: string;
  label: string;
  count: number;
  percentage: number;
  action: string;
};

export type CategoryPerformance = {
  category: string;
  label: string;
  wins: number;
  losses: number;
  winRate: number;
  avgMargin: number | null;
};

export type DistancePerformance = {
  range: string;
  minKm: number;
  maxKm: number;
  wins: number;
  losses: number;
  winRate: number;
};

export type LossPatternAnalysis = {
  byReason: LossReasonBreakdown[];
  byCategory: CategoryPerformance[];
  byDistance: DistancePerformance[];
  byPrice: { factor: string; impact: string }[];
};

export type PersonalizedAdvice = {
  relevanceScore: number;
  whyThisBidMightWin: string[];
  whyThisBidMightLose: string[];
  pastSimilarBids: { bidId: string; result: BidResult; margin: number | null; title: string }[];
  recommendation: string;
  estimatedDistanceKm: number;
  distanceWinRate: number;
};

export type ImprovementArea = {
  area: string;
  currentPerformance: string;
  potentialImpact: string;
};

const REASON_META: Record<string, { label: string; action: string; group: string }> = {
  competitive_pricing: {
    label: "Competitive pricing",
    action: "Keep using true-cost simulator before bidding",
    group: "pricing",
  },
  price_8_percent_above_l1: {
    label: "Price too high",
    action: "Use floor price calculator — stay within 5% of L1",
    group: "pricing",
  },
  price_5_percent_above_l1: {
    label: "Price too high",
    action: "Use floor price calculator — stay within 5% of L1",
    group: "pricing",
  },
  freight_uncompetitive: {
    label: "Freight uncompetitive",
    action: "Focus on bids within 200 km or use freight decoupler",
    group: "freight",
  },
  technical_rejection_bis_missing: {
    label: "Missing certification",
    action: "Get BIS / required certs before bidding",
    group: "compliance",
  },
  deadline_too_tight: {
    label: "Deadline too tight",
    action: "Check capacity vs delivery days before bidding",
    group: "capacity",
  },
  reverse_auction_panic: {
    label: "Reverse auction panic",
    action: "Set a hard floor price and do not bid below it",
    group: "pricing",
  },
  missing_oem_authorization: {
    label: "Missing OEM authorization",
    action: "Get manufacturer authorization (MAF) before bidding",
    group: "compliance",
  },
  mse_preference: {
    label: "MSE preference applied",
    action: "Prioritize MSE-reserved tenders",
    group: "eligibility",
  },
  best_technical_score: {
    label: "Strong technical score",
    action: "Lead with spec compliance and golden parameters",
    group: "technical",
  },
  local_delivery_advantage: {
    label: "Local delivery advantage",
    action: "Target Jaipur and nearby Rajasthan bids first",
    group: "location",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  office_chairs: "Office chairs",
  chairs: "Chairs",
  ergonomic_chairs: "Ergonomic chairs",
  desks: "Desks",
  tables: "Tables",
  storage: "Storage",
  computers: "Computers",
};

const DISTANCE_BANDS = [
  { range: "Within 200 km", minKm: 0, maxKm: 200 },
  { range: "200–500 km", minKm: 200, maxKm: 500 },
  { range: "Over 500 km", minKm: 500, maxKm: Infinity },
];

const CITY_DISTANCE_KM: Record<string, number> = {
  Jaipur: 15,
  Ajmer: 135,
  Kota: 245,
  Jodhpur: 340,
  Lucknow: 520,
  Bhopal: 420,
  "New Delhi": 280,
  Delhi: 280,
  Mumbai: 1180,
};

function reasonMeta(reason: string) {
  return (
    REASON_META[reason] ?? {
      label: reason.replace(/_/g, " "),
      action: "Review bid prep checklist before next submission",
      group: "other",
    }
  );
}

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category.replace(/_/g, " ");
}

function categoryFromBid(bid: BidOpportunity): string {
  const leaf = bid.categoryPath[bid.categoryPath.length - 1] ?? "";
  return leaf.toLowerCase().replace(/\s+/g, "_");
}

function historyCategoryMatches(bidCategory: string, entryCategory: string): boolean {
  const bidNorm = bidCategory.toLowerCase();
  const entryNorm = entryCategory.toLowerCase();
  return (
    bidNorm.includes(entryNorm) ||
    entryNorm.includes(bidNorm) ||
    bidNorm.split("_").some((part) => entryNorm.includes(part))
  );
}

export function loadBidHistory(): BidHistoryEntry[] {
  if (typeof window !== "undefined") {
    const accountBids = getAccountBids();
    if (accountBids.length > 0) return accountBids;
  }
  return bidHistoryData as BidHistoryEntry[];
}

export function calculateWinRate(history: BidHistoryEntry[]): number {
  if (history.length === 0) return 0;
  const wins = history.filter((entry) => entry.result === "won").length;
  return Math.round((wins / history.length) * 100);
}

export function analyzeWinPatterns(history: BidHistoryEntry[]): WinPatternAnalysis {
  const wins = history.filter((entry) => entry.result === "won");
  const losses = history.filter((entry) => entry.result === "lost");

  const margins = wins.map((entry) => entry.margin).filter((m): m is number => m !== null);
  const avgMargin =
    margins.length > 0
      ? Math.round((margins.reduce((sum, m) => sum + m, 0) / margins.length) * 10) / 10
      : 0;

  const winFactors = wins.map((entry) => reasonMeta(entry.reason).label);
  const factorCounts = new Map<string, number>();
  for (const factor of winFactors) {
    factorCounts.set(factor, (factorCounts.get(factor) ?? 0) + 1);
  }
  const commonFactors = [...factorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([factor]) => factor);

  const lossReasonCounts = new Map<string, number>();
  for (const entry of losses) {
    const label = reasonMeta(entry.reason).label;
    lossReasonCounts.set(label, (lossReasonCounts.get(label) ?? 0) + 1);
  }
  const commonReasons = [...lossReasonCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([reason]) => reason);

  const localWins = wins.filter((entry) => entry.distance <= 200).length;
  const mseWins = wins.filter((entry) => entry.mseReserved).length;
  const winRate = calculateWinRate(history);

  const insights: string[] = [
    `Overall win rate: ${winRate}% (${wins.length} wins out of ${history.length} bids).`,
    `Average margin on won bids: ${avgMargin}%.`,
    `${localWins} of ${wins.length} wins were within 200 km — local delivery is your edge.`,
    `${mseWins} wins came from MSE-reserved tenders.`,
  ];

  const recommendations: string[] = [
    "Focus on office chairs and ergonomic chairs within Rajasthan.",
    "Prioritize MSE-reserved tenders where Udyam preference applies.",
    "Use the true-cost simulator to protect margin on every bid.",
    "Avoid distant bids (>500 km) unless freight is decoupled.",
  ];

  return {
    wins: { count: wins.length, avgMargin, commonFactors },
    losses: { count: losses.length, commonReasons },
    insights,
    recommendations,
  };
}

export function analyzeLossPatterns(history: BidHistoryEntry[]): LossPatternAnalysis {
  const losses = history.filter((entry) => entry.result === "lost");
  const totalLosses = losses.length || 1;

  const reasonGroups = new Map<string, LossReasonBreakdown>();
  for (const entry of losses) {
    const meta = reasonMeta(entry.reason);
    const existing = reasonGroups.get(meta.label);
    if (existing) {
      existing.count += 1;
      existing.percentage = Math.round((existing.count / totalLosses) * 100);
    } else {
      reasonGroups.set(meta.label, {
        reason: entry.reason,
        label: meta.label,
        count: 1,
        percentage: Math.round((1 / totalLosses) * 100),
        action: meta.action,
      });
    }
  }

  const byReason = [...reasonGroups.values()].sort((a, b) => b.count - a.count);

  const categoryMap = new Map<string, { wins: number; losses: number; margins: number[] }>();
  for (const entry of history) {
    const bucket = categoryMap.get(entry.category) ?? { wins: 0, losses: 0, margins: [] };
    if (entry.result === "won") {
      bucket.wins += 1;
      if (entry.margin !== null) bucket.margins.push(entry.margin);
    } else {
      bucket.losses += 1;
    }
    categoryMap.set(entry.category, bucket);
  }

  const byCategory: CategoryPerformance[] = [...categoryMap.entries()]
    .map(([category, stats]) => {
      const total = stats.wins + stats.losses;
      return {
        category,
        label: categoryLabel(category),
        wins: stats.wins,
        losses: stats.losses,
        winRate: total > 0 ? Math.round((stats.wins / total) * 100) : 0,
        avgMargin:
          stats.margins.length > 0
            ? Math.round(
                (stats.margins.reduce((sum, m) => sum + m, 0) / stats.margins.length) * 10
              ) / 10
            : null,
      };
    })
    .sort((a, b) => b.winRate - a.winRate);

  const byDistance: DistancePerformance[] = DISTANCE_BANDS.map((band) => {
    const inBand = history.filter(
      (entry) => entry.distance >= band.minKm && entry.distance < band.maxKm
    );
    const wins = inBand.filter((entry) => entry.result === "won").length;
    const losses = inBand.filter((entry) => entry.result === "lost").length;
    const total = inBand.length;
    return {
      range: band.range,
      minKm: band.minKm,
      maxKm: band.maxKm,
      wins,
      losses,
      winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
    };
  });

  const priceLosses = losses.filter((entry) =>
    entry.reason.startsWith("price_")
  ).length;
  const freightLosses = losses.filter(
    (entry) => entry.reason === "freight_uncompetitive"
  ).length;

  const byPrice = [
    {
      factor: "Pricing above L1",
      impact: `${Math.round((priceLosses / totalLosses) * 100)}% of losses — tighten floor price discipline`,
    },
    {
      factor: "Freight on distant bids",
      impact: `${Math.round((freightLosses / totalLosses) * 100)}% of losses — stay local or decouple freight`,
    },
    {
      factor: "Reverse auction undercutting",
      impact: "Set non-negotiable floor before RA starts",
    },
  ];

  return { byReason, byCategory, byDistance, byPrice };
}

export function estimateBidDistance(seller: SellerProfile, bid: BidOpportunity): number {
  const cityDistance = CITY_DISTANCE_KM[bid.location.city];
  if (cityDistance !== undefined) return cityDistance;
  if (bid.location.state === seller.state) return 180;
  if (bid.location.state === "Delhi") return 280;
  return 600;
}

export function getPersonalizedAdvice(
  history: BidHistoryEntry[],
  newBid: BidOpportunity,
  seller: SellerProfile
): PersonalizedAdvice {
  const bidCategory = categoryFromBid(newBid);
  const estimatedDistanceKm = estimateBidDistance(seller, newBid);

  const similar = history.filter((entry) =>
    historyCategoryMatches(bidCategory, entry.category)
  );

  const pastSimilarBids = similar.slice(0, 5).map((entry) => ({
    bidId: entry.bidId,
    result: entry.result,
    margin: entry.margin,
    title: entry.title,
  }));

  const similarWins = similar.filter((entry) => entry.result === "won").length;
  const similarTotal = similar.length;
  const similarWinRate = similarTotal > 0 ? Math.round((similarWins / similarTotal) * 100) : 0;

  const distanceBand = DISTANCE_BANDS.find(
    (band) => estimatedDistanceKm >= band.minKm && estimatedDistanceKm < band.maxKm
  );
  const distanceHistory = history.filter(
    (entry) =>
      entry.distance >= (distanceBand?.minKm ?? 0) &&
      entry.distance < (distanceBand?.maxKm ?? Infinity)
  );
  const distanceWins = distanceHistory.filter((entry) => entry.result === "won").length;
  const distanceWinRate =
    distanceHistory.length > 0
      ? Math.round((distanceWins / distanceHistory.length) * 100)
      : 0;

  const whyThisBidMightWin: string[] = [];
  const whyThisBidMightLose: string[] = [];

  if (estimatedDistanceKm <= 200) {
    whyThisBidMightWin.push(
      `Bid is ~${estimatedDistanceKm} km away — your win rate within 200 km is strong.`
    );
  } else {
    whyThisBidMightLose.push(
      `Bid is ~${estimatedDistanceKm} km away. Your win rate at this distance: ${distanceWinRate}%.`
    );
  }

  if (newBid.mseReserved && seller.mseCategory) {
    whyThisBidMightWin.push("MSE-reserved tender — Udyam preference may apply.");
  }

  if (similarTotal > 0) {
    whyThisBidMightWin.push(
      `Similar past bids: ${similarWins} won, ${similarTotal - similarWins} lost (${similarWinRate}% win rate).`
    );
  } else {
    whyThisBidMightLose.push("No close category match in your bid history — higher uncertainty.");
  }

  const missingCerts = newBid.requiredCertifications.filter(
    (cert) =>
      !seller.certifications.some((owned) =>
        owned.toLowerCase().includes(cert.toLowerCase().replace("-micro", ""))
      )
  );
  if (missingCerts.length > 0) {
    whyThisBidMightLose.push(`Missing certifications: ${missingCerts.join(", ")}.`);
  }

  if (newBid.evaluationCriteria.some((c) => c.toLowerCase().includes("l1"))) {
    whyThisBidMightLose.push(
      "L1 evaluation — reverse auction risk could squeeze margin below floor."
    );
  }

  if (whyThisBidMightWin.length === 0) {
    whyThisBidMightWin.push("Run readiness and true-cost checks before committing.");
  }

  let relevanceScore = 50;
  relevanceScore += similarWinRate * 0.25;
  relevanceScore += distanceWinRate * 0.2;
  if (newBid.mseReserved) relevanceScore += 10;
  if (estimatedDistanceKm <= 200) relevanceScore += 15;
  if (missingCerts.length > 0) relevanceScore -= 20;
  relevanceScore = Math.max(0, Math.min(100, Math.round(relevanceScore)));

  let recommendation: string;
  if (relevanceScore >= 70) {
    recommendation =
      "Strong fit — bid if readiness passes and floor price leaves 8%+ true margin.";
  } else if (relevanceScore >= 50) {
    recommendation =
      "Moderate fit — price within 5% of L1, ensure all certs ready, set RA floor.";
  } else {
    recommendation =
      "Weak fit — consider walking away unless strategically important for rating.";
  }

  return {
    relevanceScore,
    whyThisBidMightWin,
    whyThisBidMightLose,
    pastSimilarBids,
    recommendation,
    estimatedDistanceKm,
    distanceWinRate,
  };
}

export function getImprovementAreas(history: BidHistoryEntry[]): ImprovementArea[] {
  const lossPatterns = analyzeLossPatterns(history);
  const winRate = calculateWinRate(history);
  const targetRate = Math.min(winRate + 20, 55);

  const areas: ImprovementArea[] = [];

  const localBand = lossPatterns.byDistance.find((band) => band.minKm === 0);
  if (localBand && localBand.winRate > 0) {
    areas.push({
      area: "Focus on bids within 200 km",
      currentPerformance: `${localBand.winRate}% win rate locally vs ${winRate}% overall`,
      potentialImpact: `Could lift overall win rate toward ${targetRate}%`,
    });
  }

  const topLoss = lossPatterns.byReason[0];
  if (topLoss) {
    areas.push({
      area: topLoss.action.split("—")[0]?.trim() ?? topLoss.label,
      currentPerformance: `${topLoss.label} caused ${topLoss.count} losses (${topLoss.percentage}%)`,
      potentialImpact: "Removing top loss reason is fastest path to more wins",
    });
  }

  const bestCategory = lossPatterns.byCategory.find((cat) => cat.winRate >= 50);
  if (bestCategory) {
    areas.push({
      area: `Double down on ${bestCategory.label}`,
      currentPerformance: `${bestCategory.winRate}% win rate, ${bestCategory.avgMargin ?? "—"}% avg margin`,
      potentialImpact: "Specialise instead of spreading across categories",
    });
  } else {
    areas.push({
      area: "Set floor prices before reverse auctions",
      currentPerformance: "RA panic caused at least one loss in your history",
      potentialImpact: "Protects margin when L1 pressure intensifies",
    });
  }

  return areas.slice(0, 3);
}

export function getSweetSpots(history: BidHistoryEntry[]): string[] {
  const lossPatterns = analyzeLossPatterns(history);
  const winPatterns = analyzeWinPatterns(history);
  const spots: string[] = [];

  const local = lossPatterns.byDistance.find((band) => band.minKm === 0);
  if (local) {
    spots.push(`You win ${local.winRate}% of bids within 200 km`);
  }

  const mseWins = history.filter((entry) => entry.result === "won" && entry.mseReserved);
  const mseTotal = history.filter((entry) => entry.mseReserved);
  if (mseTotal.length > 0) {
    const mseRate = Math.round((mseWins.length / mseTotal.length) * 100);
    spots.push(`You win ${mseRate}% of MSE-reserved tenders`);
  }

  const topCategory = lossPatterns.byCategory[0];
  if (topCategory && topCategory.avgMargin !== null) {
    spots.push(
      `Your avg margin is ${topCategory.avgMargin}% on ${topCategory.label.toLowerCase()}`
    );
  }

  if (winPatterns.wins.commonFactors.length > 0) {
    spots.push(`Winning factors: ${winPatterns.wins.commonFactors.slice(0, 2).join(", ")}`);
  }

  spots.push("Focus on: office chairs, local delivery, MSE-reserved");

  return spots.slice(0, 4);
}

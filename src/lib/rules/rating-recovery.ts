import { getToday } from "@/lib/rules/msme-rights";

export type SellerRating = {
  overall: number;
  onTimeDelivery: number;
  qualityCompliance: number;
  buyerSatisfaction: number;
  responseRate: number;
  orderCancellation: number;
  totalOrders: number;
  totalRevenue: number;
  catalogLastUpdate?: string;
  lateDeliveriesThisMonth?: number;
};

export type RatingComponent = {
  key: string;
  label: string;
  score: number;
  weight: number;
  weightedScore: number;
};

export type RatingAnalysis = {
  fulfillment: number;
  feedback: number;
  quality: number;
  response: number;
  freshness: number;
  weights: Record<string, number>;
  components: RatingComponent[];
};

export type WeakArea = {
  area: string;
  currentScore: number;
  impact: "high" | "medium" | "low";
  improvement: string[];
};

export type RecoveryAction = {
  step: number;
  action: string;
  ratingBoost: number;
};

export type RecoveryPlan = {
  actions: RecoveryAction[];
  estimatedOrders: number;
  timeline: string;
};

export type CatalogFreshness = {
  daysSince: number;
  needsUpdate: boolean;
  impact: string;
};

const WEIGHTS = {
  fulfillment: 0.4,
  feedback: 0.25,
  quality: 0.2,
  response: 0.1,
  freshness: 0.05,
} as const;

const FRESHNESS_THRESHOLD_DAYS = 30;
const WEAK_SCORE_THRESHOLD = 4.0;

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function daysSince(date: string, today = getToday()): number {
  const start = parseDate(date);
  const end = parseDate(today);
  return Math.max(
    0,
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );
}

function freshnessScore(daysSinceUpdate: number): number {
  if (daysSinceUpdate <= FRESHNESS_THRESHOLD_DAYS) return 5;
  if (daysSinceUpdate <= 45) return 3.5;
  if (daysSinceUpdate <= 60) return 2.5;
  return 2;
}

export function getCatalogFreshness(lastUpdate: string): CatalogFreshness {
  const daysSinceUpdate = daysSince(lastUpdate);
  const needsUpdate = daysSinceUpdate > FRESHNESS_THRESHOLD_DAYS;

  let impact: string;
  if (daysSinceUpdate <= FRESHNESS_THRESHOLD_DAYS) {
    impact = "Catalog is fresh — no negative impact on rating.";
  } else if (daysSinceUpdate <= 45) {
    impact = `Listings last updated ${daysSinceUpdate} days ago. Update prices and specs to recover catalog freshness score.`;
  } else {
    impact = `Listings stale (${daysSinceUpdate} days). GeM deprioritizes outdated catalogues in search and rating.`;
  }

  return { daysSince: daysSinceUpdate, needsUpdate, impact };
}

export function analyzeRatingComponents(rating: SellerRating): RatingAnalysis {
  const freshnessDays = rating.catalogLastUpdate
    ? daysSince(rating.catalogLastUpdate)
    : 45;
  const freshness = freshnessScore(freshnessDays);

  const components: RatingComponent[] = [
    {
      key: "fulfillment",
      label: "Order fulfillment",
      score: rating.onTimeDelivery,
      weight: WEIGHTS.fulfillment,
      weightedScore: rating.onTimeDelivery * WEIGHTS.fulfillment,
    },
    {
      key: "feedback",
      label: "Buyer feedback",
      score: rating.buyerSatisfaction,
      weight: WEIGHTS.feedback,
      weightedScore: rating.buyerSatisfaction * WEIGHTS.feedback,
    },
    {
      key: "quality",
      label: "Quality inspection",
      score: rating.qualityCompliance,
      weight: WEIGHTS.quality,
      weightedScore: rating.qualityCompliance * WEIGHTS.quality,
    },
    {
      key: "response",
      label: "Response rate",
      score: rating.responseRate,
      weight: WEIGHTS.response,
      weightedScore: rating.responseRate * WEIGHTS.response,
    },
    {
      key: "freshness",
      label: "Catalog freshness",
      score: freshness,
      weight: WEIGHTS.freshness,
      weightedScore: freshness * WEIGHTS.freshness,
    },
  ];

  return {
    fulfillment: rating.onTimeDelivery,
    feedback: rating.buyerSatisfaction,
    quality: rating.qualityCompliance,
    response: rating.responseRate,
    freshness,
    weights: { ...WEIGHTS },
    components,
  };
}

export function identifyWeakAreas(rating: SellerRating): WeakArea[] {
  const areas: WeakArea[] = [];
  const freshness = rating.catalogLastUpdate
    ? getCatalogFreshness(rating.catalogLastUpdate)
    : { daysSince: 45, needsUpdate: true, impact: "" };

  if (rating.onTimeDelivery < WEAK_SCORE_THRESHOLD) {
    const lateCount = rating.lateDeliveriesThisMonth ?? 0;
    areas.push({
      area: "Order fulfillment",
      currentScore: rating.onTimeDelivery,
      impact: "high",
      improvement: [
        lateCount > 0
          ? `${lateCount} late deliveries this month. Focus on local orders with shorter transit.`
          : "On-time delivery below 4.0 — build buffer days into every delivery commitment.",
        "Confirm consignee availability before dispatch.",
        "Use delivery POD checklist — delays often start at acceptance, not transit.",
      ],
    });
  }

  if (rating.buyerSatisfaction < WEAK_SCORE_THRESHOLD) {
    areas.push({
      area: "Buyer feedback",
      currentScore: rating.buyerSatisfaction,
      impact: "high",
      improvement: [
        `Buyers rated ${rating.buyerSatisfaction}/5. Ask for feedback after every delivery.`,
        "Send a thank-you message with GeM feedback link within 24 hours of CRAC.",
        "Fix recurring complaints before bidding on larger orders.",
      ],
    });
  }

  if (rating.qualityCompliance < WEAK_SCORE_THRESHOLD) {
    areas.push({
      area: "Quality inspection",
      currentScore: rating.qualityCompliance,
      impact: "medium",
      improvement: [
        "Add BIS/quality certificates to catalogue listings.",
        "Pre-inspect batch before dispatch — government QA rejects are costly.",
        "Match golden parameters exactly to avoid inspection failures.",
      ],
    });
  }

  if (rating.responseRate < WEAK_SCORE_THRESHOLD) {
    areas.push({
      area: "Response rate",
      currentScore: rating.responseRate,
      impact: "medium",
      improvement: [
        "Respond to all buyer queries within 24 hours.",
        "Enable GeM email/SMS notifications on your phone.",
        "Set a daily 10 AM check for pending messages.",
      ],
    });
  }

  if (freshness.needsUpdate) {
    areas.push({
      area: "Catalog freshness",
      currentScore: freshnessScore(freshness.daysSince),
      impact: "low",
      improvement: [
        `Listings last updated ${freshness.daysSince} days ago. Update prices and stock.`,
        "Refresh product images after delivery — shows active seller.",
        "Review golden parameters against latest GeM category specs.",
      ],
    });
  }

  return areas.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}

export function getRecoveryPlan(
  currentRating: number,
  targetRating: number
): RecoveryPlan {
  const gap = Math.max(0, targetRating - currentRating);

  const actions: RecoveryAction[] = [
    {
      step: 1,
      action: "Complete 3 small local orders perfectly (on-time + POD + feedback request)",
      ratingBoost: 0.15,
    },
    {
      step: 2,
      action: "Update all catalogue listings (prices, images, golden parameters)",
      ratingBoost: 0.05,
    },
    {
      step: 3,
      action: "Respond to all buyer queries within 24 hours for 30 days",
      ratingBoost: 0.05,
    },
    {
      step: 4,
      action: "Add quality certificates (BIS/ISO) to active listings",
      ratingBoost: 0.1,
    },
  ];

  const totalBoost = actions.reduce((sum, item) => sum + item.ratingBoost, 0);
  const ordersPerPoint = 2.5;
  const estimatedOrders = Math.ceil(gap * ordersPerPoint);
  const months = Math.max(2, Math.ceil(estimatedOrders / 3));

  return {
    actions,
    estimatedOrders: Math.max(estimatedOrders, 3),
    timeline:
      gap <= 0
        ? "You've reached your target — maintain with consistent delivery."
        : `From ${currentRating.toFixed(1)} to ${targetRating.toFixed(1)}: ~${estimatedOrders} perfect orders over ${months}-${months + 1} months (max boost ~${totalBoost.toFixed(2)} if all steps followed).`,
  };
}

export function projectRatingAfterOrders(
  currentRating: number,
  currentOrders: number,
  newOrders: number,
  newOrderRating: number
): number {
  const totalOrders = currentOrders + newOrders;
  if (totalOrders <= 0) return currentRating;
  const projected =
    (currentRating * currentOrders + newOrderRating * newOrders) / totalOrders;
  return Math.round(projected * 10) / 10;
}

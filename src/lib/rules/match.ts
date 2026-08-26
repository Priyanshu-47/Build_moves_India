import {
  BidOpportunity,
  Blocker,
  MatchDimensions,
  MatchResult,
  SellerProfile,
  Warning,
} from "@/lib/schemas";

const WEIGHTS = {
  product: 0.3,
  location: 0.2,
  capacity: 0.15,
  eligibility: 0.2,
  certifications: 0.15,
} as const;

const ADJACENT_STATES: Record<string, string[]> = {
  Rajasthan: ["Uttar Pradesh", "Delhi", "Haryana", "Gujarat", "Madhya Pradesh", "Punjab"],
  "Uttar Pradesh": ["Rajasthan", "Delhi", "Haryana", "Madhya Pradesh", "Uttarakhand", "Bihar"],
  Delhi: ["Rajasthan", "Uttar Pradesh", "Haryana"],
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.round(Math.max(min, Math.min(max, value)));
}

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

function hasCertification(sellerCerts: string[], required: string): boolean {
  const requiredNorm = normalizeText(required);

  return sellerCerts.some((cert) => {
    const certNorm = normalizeText(cert);
    if (certNorm === requiredNorm) return true;
    if (requiredNorm === "udyam" && certNorm.startsWith("udyam")) return true;
    if (requiredNorm.startsWith("udyam") && certNorm.startsWith("udyam")) return true;
    if (certNorm.includes(requiredNorm) || requiredNorm.includes(certNorm)) return true;
    return false;
  });
}

function isDeadlinePassed(deadline: string): boolean {
  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999);
  return end.getTime() < Date.now();
}

function hoursUntilDeadline(deadline: string): number {
  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999);
  return (end.getTime() - Date.now()) / (1000 * 60 * 60);
}

function scoreProductMatch(seller: SellerProfile, bid: BidOpportunity): number {
  const bidText = normalizeText(
    [bid.title, ...bid.categoryPath].join(" ")
  );

  let bestScore = 0;

  for (const product of seller.products) {
    const productNorm = normalizeText(product);

    if (bidText.includes(productNorm)) {
      bestScore = Math.max(bestScore, 100);
      continue;
    }

    const words = productNorm.split(/\s+/).filter((word) => word.length > 2);
    if (words.length === 0) continue;

    const matchedWords = words.filter((word) => bidText.includes(word));
    if (matchedWords.length > 0) {
      const partialScore = (matchedWords.length / words.length) * 85;
      bestScore = Math.max(bestScore, partialScore);
    }
  }

  return clamp(bestScore);
}

function scoreLocationProximity(seller: SellerProfile, bid: BidOpportunity): number {
  const sameState =
    normalizeText(seller.state) === normalizeText(bid.location.state);
  const sameCity =
    normalizeText(seller.city) === normalizeText(bid.location.city);

  if (sameState && sameCity) return 100;
  if (sameState) return 75;

  const adjacent =
    ADJACENT_STATES[seller.state]?.some(
      (state) => normalizeText(state) === normalizeText(bid.location.state)
    ) ?? false;

  if (adjacent) return 45;
  return 20;
}

function scoreCapacityFit(seller: SellerProfile, bid: BidOpportunity): number {
  const monthsToDeliver = Math.max(bid.deliveryDays / 30, 1);
  const monthlyNeed = bid.quantity / monthsToDeliver;

  if (monthlyNeed <= 0) return 100;
  if (seller.monthlyCapacity >= monthlyNeed) return 100;

  return clamp((seller.monthlyCapacity / monthlyNeed) * 100);
}

function scoreEligibility(seller: SellerProfile, bid: BidOpportunity): number {
  let score = 0;
  let checks = 0;

  if (seller.cautionMoneyPaid) score += 35;
  checks += 35;

  if (seller.bankVerified) score += 35;
  checks += 35;

  const profileComplete =
    seller.name.trim().length > 0 &&
    seller.businessName.trim().length > 0 &&
    seller.products.length > 0;

  if (profileComplete) score += 30;
  checks += 30;

  if (bid.mseReserved) {
    if (seller.mseCategory) {
      score = clamp(score + 10);
    } else {
      score = clamp(score - 25);
    }
  }

  return clamp((score / checks) * 100);
}

function scoreCertificationFit(
  seller: SellerProfile,
  bid: BidOpportunity
): number {
  if (bid.requiredCertifications.length === 0) return 100;

  const matched = bid.requiredCertifications.filter((required) =>
    hasCertification(seller.certifications, required)
  );

  return clamp((matched.length / bid.requiredCertifications.length) * 100);
}

function buildBlockersAndWarnings(
  seller: SellerProfile,
  bid: BidOpportunity,
  dimensions: MatchDimensions
): { blockers: Blocker[]; warnings: Warning[] } {
  const blockers: Blocker[] = [];
  const warnings: Warning[] = [];

  if (isDeadlinePassed(bid.deadline)) {
    blockers.push({
      code: "DEADLINE_SOON",
      message: "Bid deadline has passed.",
      severity: "critical",
    });
  } else if (hoursUntilDeadline(bid.deadline) < 48) {
    warnings.push({
      code: "DEADLINE_SOON",
      message: "Less than 48 hours left to submit.",
    });
  }

  if (dimensions.product === 0) {
    blockers.push({
      code: "CATEGORY_WRONG",
      message: "Your products do not match this tender category.",
      severity: "critical",
    });
  }

  if (bid.mseReserved && !seller.mseCategory) {
    blockers.push({
      code: "CATEGORY_WRONG",
      message: "This tender is reserved for MSE sellers.",
      severity: "critical",
    });
  }

  if (!seller.cautionMoneyPaid) {
    blockers.push({
      code: "CAUTION_MONEY",
      message: "Caution money has not been deposited.",
      severity: "critical",
    });
  }

  if (dimensions.capacity < 50) {
    blockers.push({
      code: "CAPACITY_LOW",
      message: "Your monthly capacity is below the tender requirement.",
      severity: "critical",
    });
  }

  if (dimensions.location < 50) {
    warnings.push({
      code: "LOCATION_FAR",
      message: "Delivery location is far from your base.",
    });
  }

  const missingCerts = bid.requiredCertifications.filter(
    (required) => !hasCertification(seller.certifications, required)
  );

  if (missingCerts.includes("BIS")) {
    blockers.push({
      code: "BIS_MISSING",
      message: "BIS certificate required for this category.",
      severity: "critical",
    });
  } else if (missingCerts.length > 0) {
    warnings.push({
      code: "CERT_MISSING",
      message: `Missing certifications: ${missingCerts.join(", ")}.`,
    });
  }

  return { blockers, warnings };
}

function computeWeightedScore(dimensions: MatchDimensions): number {
  return clamp(
    dimensions.product * WEIGHTS.product +
      dimensions.location * WEIGHTS.location +
      dimensions.capacity * WEIGHTS.capacity +
      dimensions.eligibility * WEIGHTS.eligibility +
      dimensions.certifications * WEIGHTS.certifications
  );
}

export function computeMatch(
  seller: SellerProfile,
  bid: BidOpportunity
): MatchResult {
  const dimensions: MatchDimensions = {
    product: scoreProductMatch(seller, bid),
    location: scoreLocationProximity(seller, bid),
    capacity: scoreCapacityFit(seller, bid),
    eligibility: scoreEligibility(seller, bid),
    certifications: scoreCertificationFit(seller, bid),
  };

  const { blockers, warnings } = buildBlockersAndWarnings(
    seller,
    bid,
    dimensions
  );

  const matchScore = computeWeightedScore(dimensions);
  const hasCriticalBlocker = blockers.some(
    (blocker) => blocker.severity === "critical"
  );

  return {
    bidId: bid.id,
    matchScore,
    dimensions,
    blockers,
    warnings,
    pursue: matchScore >= 60 && !hasCriticalBlocker,
  };
}

export function rankBids(
  seller: SellerProfile,
  bids: BidOpportunity[]
): Array<{ bid: BidOpportunity; match: MatchResult }> {
  return bids
    .map((bid) => ({
      bid,
      match: computeMatch(seller, bid),
    }))
    .sort((a, b) => b.match.matchScore - a.match.matchScore);
}

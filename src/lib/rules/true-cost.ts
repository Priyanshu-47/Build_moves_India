import vendorDesertsData from "@/data/vendor-deserts.json";
import { BidOpportunity, SellerProfile } from "@/lib/schemas";
import { GST_RATE } from "@/lib/rules/gst-planner";
import { calculateFreight } from "@/lib/rules/freight";

export type RiskLevel = "safe" | "caution" | "danger" | "loss";
export type BidRecommendation = "strong_bid" | "bid" | "caution" | "walk_away";

export type CostBreakdownItem = {
  item: string;
  amount: number;
  note: string;
};

export type TrueCostResult = {
  productCost: number;
  freightCost: number;
  packagingCost: number;
  installationCost: number;
  gstExposure: number;
  workingCapitalCost: number;
  reverseAuctionRisk: number;
  complianceCost: number;
  totalCost: number;
  estimatedRevenue: number;
  realMargin: number;
  realMarginPercent: number;
  floorPrice: number;
  riskLevel: RiskLevel;
  recommendation: BidRecommendation;
  recommendationReason: string;
  breakdown: CostBreakdownItem[];
};

export type WorkingCapitalResult = {
  lockedCapital: number;
  costOfCapital: number;
  opportunityCost: number;
};

export type FreightImpactResult = {
  cost: number;
  percentOfOrder: number;
  impact: "low" | "medium" | "high" | "critical";
};

export type StressScenario = {
  scenario: string;
  margin: number;
  isViable: boolean;
};

const ANNUAL_COST_OF_CAPITAL = 0.12;
const PRODUCT_COST_RATIO = 0.72;
const PACKAGING_RATE = 0.025;
const INSTALLATION_RATE = 0.04;

const CITY_PINS: Record<string, string> = {
  Jaipur: "302001",
  Lucknow: "226001",
  "New Delhi": "110001",
  Delhi: "110001",
};

function round(value: number): number {
  return Math.round(value);
}

function sellerPin(seller: SellerProfile): string {
  const byCity = CITY_PINS[seller.city];
  if (byCity) return byCity;
  const byState =
    vendorDesertsData.originPinByState[
      seller.state as keyof typeof vendorDesertsData.originPinByState
    ];
  return byState ?? "302001";
}

function buyerPin(bid: BidOpportunity): string {
  const byCity = CITY_PINS[bid.location.city];
  if (byCity) return byCity;
  const byState =
    vendorDesertsData.destPinByRegion[
      bid.location.state as keyof typeof vendorDesertsData.destPinByRegion
    ];
  if (byState) return byState;

  const prefix = vendorDesertsData.originPinByState[
    bid.location.state as keyof typeof vendorDesertsData.originPinByState
  ];
  return prefix ?? "110001";
}

function estimateWeightPerUnit(bid: BidOpportunity): number {
  const leaf = bid.categoryPath[bid.categoryPath.length - 1]?.toLowerCase() ?? "";
  if (leaf.includes("chair")) return 15;
  if (leaf.includes("desk") || leaf.includes("table")) return 28;
  if (leaf.includes("rack")) return 45;
  return 20;
}

function needsInstallation(bid: BidOpportunity): boolean {
  return bid.evaluationCriteria.some((criteria) =>
    criteria.toLowerCase().includes("installation")
  );
}

function estimateComplianceCost(bid: BidOpportunity, seller: SellerProfile): number {
  let cost = 0;
  const sellerCerts = seller.certifications.map((cert) => cert.toLowerCase());

  for (const required of bid.requiredCertifications) {
    const norm = required.toLowerCase();
    const hasCert = sellerCerts.some(
      (cert) => cert.includes(norm) || norm.includes(cert.replace("-micro", ""))
    );
    if (!hasCert) {
      if (norm.includes("iso")) cost += 15000;
      else if (norm.includes("bis")) cost += 8000;
      else cost += 5000;
    }
  }

  if (!seller.mseCategory && bid.mseReserved) {
    cost += 3000;
  }

  return cost;
}

function isReverseAuction(bid: BidOpportunity): boolean {
  return bid.evaluationCriteria.some((criteria) =>
    criteria.toLowerCase().includes("l1")
  );
}

export function calculateWorkingCapital(
  orderValue: number,
  paymentDays: number
): WorkingCapitalResult {
  const lockedCapital = round(orderValue * 0.65);
  const dailyRate = ANNUAL_COST_OF_CAPITAL / 365;
  const costOfCapital = round(lockedCapital * dailyRate * paymentDays);
  const opportunityCost = round(costOfCapital * 0.35);

  return { lockedCapital, costOfCapital, opportunityCost };
}

export function calculateFreightImpact(
  sellerPinCode: string,
  buyerPinCode: string,
  weightKg: number,
  orderValue: number
): FreightImpactResult {
  const freight = calculateFreight(sellerPinCode, buyerPinCode, weightKg, "medium");
  const percentOfOrder = orderValue > 0 ? (freight.freightCost / orderValue) * 100 : 0;

  let impact: FreightImpactResult["impact"];
  if (percentOfOrder >= 20) impact = "critical";
  else if (percentOfOrder >= 12) impact = "high";
  else if (percentOfOrder >= 6) impact = "medium";
  else impact = "low";

  return {
    cost: freight.freightCost,
    percentOfOrder: Math.round(percentOfOrder * 10) / 10,
    impact,
  };
}

function deriveRiskLevel(marginPercent: number): RiskLevel {
  if (marginPercent < 0) return "loss";
  if (marginPercent < 3) return "danger";
  if (marginPercent < 10) return "caution";
  return "safe";
}

function deriveRecommendation(
  marginPercent: number,
  riskLevel: RiskLevel,
  freightImpact: FreightImpactResult
): { recommendation: BidRecommendation; reason: string } {
  if (riskLevel === "loss" || marginPercent < 0) {
    return {
      recommendation: "walk_away",
      reason: "True margin is negative — you would lose money on this bid.",
    };
  }

  if (freightImpact.impact === "critical" && marginPercent < 12) {
    return {
      recommendation: "walk_away",
      reason: `Freight is ${freightImpact.percentOfOrder}% of order value — margin too thin after logistics.`,
    };
  }

  if (marginPercent >= 15 && riskLevel === "safe") {
    return {
      recommendation: "strong_bid",
      reason: "Healthy margin after freight, GST, and working capital. Good fit.",
    };
  }

  if (marginPercent >= 8) {
    return {
      recommendation: "bid",
      reason: "Acceptable margin — proceed if capacity and compliance are clear.",
    };
  }

  if (marginPercent >= 3) {
    return {
      recommendation: "caution",
      reason: "Thin margin — only bid if strategic (rating, repeat buyer, local delivery).",
    };
  }

  return {
    recommendation: "walk_away",
    reason: "Margin below 3% — one delay or price cut wipes out profit.",
  };
}

export function calculateTrueCost(
  bid: BidOpportunity,
  seller: SellerProfile,
  bidAmount?: number
): TrueCostResult {
  const estimatedRevenue = bidAmount ?? bid.estimatedValue;
  const weightPerUnit = estimateWeightPerUnit(bid);
  const totalWeight = weightPerUnit * bid.quantity;
  const origin = sellerPin(seller);
  const destination = buyerPin(bid);

  const freightImpact = calculateFreightImpact(
    origin,
    destination,
    totalWeight,
    estimatedRevenue
  );

  const productCost = round(estimatedRevenue * PRODUCT_COST_RATIO);
  const freightCost = freightImpact.cost;
  const packagingCost = round(estimatedRevenue * PACKAGING_RATE);
  const installationCost = needsInstallation(bid)
    ? round(estimatedRevenue * INSTALLATION_RATE)
    : 0;

  const paymentDays = bid.deliveryDays + 45;
  const workingCapital = calculateWorkingCapital(estimatedRevenue, paymentDays);
  const workingCapitalCost = workingCapital.costOfCapital + workingCapital.opportunityCost;

  const gstExposure = round(estimatedRevenue * GST_RATE * 0.4);
  const reverseAuctionRisk = isReverseAuction(bid)
    ? round(estimatedRevenue * 0.06)
    : round(estimatedRevenue * 0.02);
  const complianceCost = estimateComplianceCost(bid, seller);

  const totalCost = round(
    productCost +
      freightCost +
      packagingCost +
      installationCost +
      gstExposure +
      workingCapitalCost +
      reverseAuctionRisk +
      complianceCost
  );

  const realMargin = estimatedRevenue - totalCost;
  const realMarginPercent =
    estimatedRevenue > 0
      ? Math.round((realMargin / estimatedRevenue) * 1000) / 10
      : 0;

  const floorPrice = round(totalCost * 1.05);
  const riskLevel = deriveRiskLevel(realMarginPercent);
  const { recommendation, reason } = deriveRecommendation(
    realMarginPercent,
    riskLevel,
    freightImpact
  );

  const breakdown: CostBreakdownItem[] = [
    {
      item: "Product cost",
      amount: productCost,
      note: "~72% of bid value (materials + labour)",
    },
    {
      item: "Freight",
      amount: freightCost,
      note: `${origin} → ${destination}, ${totalWeight} kg total`,
    },
    {
      item: "Packaging",
      amount: packagingCost,
      note: "2.5% of order value",
    },
    ...(installationCost > 0
      ? [
          {
            item: "Installation",
            amount: installationCost,
            note: "Required per tender evaluation criteria",
          },
        ]
      : []),
    {
      item: "GST exposure",
      amount: gstExposure,
      note: "GST due before buyer payment arrives",
    },
    {
      item: "Working capital",
      amount: workingCapitalCost,
      note: `${paymentDays} days locked @ 12% p.a.`,
    },
    {
      item: "Reverse auction / L1 risk",
      amount: reverseAuctionRisk,
      note: isReverseAuction(bid) ? "6% buffer for L1 competition" : "2% price buffer",
    },
    ...(complianceCost > 0
      ? [
          {
            item: "Compliance gap",
            amount: complianceCost,
            note: "Missing certifications for this tender",
          },
        ]
      : []),
  ];

  return {
    productCost,
    freightCost,
    packagingCost,
    installationCost,
    gstExposure,
    workingCapitalCost,
    reverseAuctionRisk,
    complianceCost,
    totalCost,
    estimatedRevenue,
    realMargin,
    realMarginPercent,
    floorPrice,
    riskLevel,
    recommendation,
    recommendationReason: reason,
    breakdown,
  };
}

export function stressTest(
  bid: BidOpportunity,
  seller: SellerProfile,
  bidAmount?: number
): StressScenario[] {
  const base = calculateTrueCost(bid, seller, bidAmount);
  const scenarios: { label: string; adjust: (revenue: number, cost: number) => { revenue: number; cost: number } }[] = [
    {
      label: "Payment delayed 60 days",
      adjust: (revenue, cost) => {
        const extraWc = calculateWorkingCapital(revenue, 60);
        return { revenue, cost: cost + extraWc.costOfCapital };
      },
    },
    {
      label: "Reverse auction drops 10%",
      adjust: (revenue, cost) => ({
        revenue: round(revenue * 0.9),
        cost,
      }),
    },
    {
      label: "Freight spikes 20%",
      adjust: (revenue, cost) => ({
        revenue,
        cost: cost + round(base.freightCost * 0.2),
      }),
    },
    {
      label: "GST paid before payment received",
      adjust: (revenue, cost) => ({
        revenue,
        cost: cost + round(revenue * GST_RATE * 0.15),
      }),
    },
  ];

  return scenarios.map(({ label, adjust }) => {
    const revenue = base.estimatedRevenue;
    const adjusted = adjust(revenue, base.totalCost);
    const margin = adjusted.revenue - adjusted.cost;
    return {
      scenario: label,
      margin,
      isViable: margin > 0 && margin / adjusted.revenue >= 0.03,
    };
  });
}

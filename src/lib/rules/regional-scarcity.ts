import vendorDesertsData from "@/data/vendor-deserts.json";
import sellersData from "@/data/sellers.json";
import { SellerProfile, parseSellers } from "@/lib/schemas";
import { calculateFreight } from "@/lib/rules/freight";

export type CompetitionLevel = "low" | "medium" | "high";
export type ScarcityLevel = "moderate" | "high" | "critical";

export type VendorDesert = {
  region: string;
  states: string[];
  sellerCount: number;
  demandCount: number;
  scarcityIndex: number;
  avgOrderValue: number;
  competitionLevel: CompetitionLevel;
  sellerOpportunity: string;
  winMultiplier: number;
};

export type CategoryScarcity = {
  category: string;
  categoryKey: string;
  neSellers: number;
  neBids: number;
  scarcityLevel: ScarcityLevel;
  scarcityIndex: number;
};

export type ExpansionAdvice = {
  recommendedRegions: string[];
  reason: string;
  estimatedWinRate: number;
  estimatedTransportCost: number;
  sellerLocation: string;
  sellerProducts: string;
  topRecommendation: {
    region: string;
    sellerCount: number;
    demandCount: number;
    winRate: number;
    transportCost: number;
    transportPercent: number;
  };
};

type DesertRecord = (typeof vendorDesertsData.vendorDeserts)[number];

function computeScarcityIndex(sellerCount: number, demandCount: number): number {
  const ratio = demandCount / Math.max(sellerCount, 1);
  return Math.min(100, Math.round(ratio * 8));
}

function competitionFromIndex(index: number): CompetitionLevel {
  if (index >= 70) return "low";
  if (index >= 45) return "medium";
  return "high";
}

function opportunityLabel(winMultiplier: number): string {
  return `${winMultiplier}× more chances to win`;
}

function mapDesert(record: DesertRecord): VendorDesert {
  const scarcityIndex = computeScarcityIndex(record.sellerCount, record.demandCount);
  return {
    region: record.region,
    states: record.states,
    sellerCount: record.sellerCount,
    demandCount: record.demandCount,
    scarcityIndex,
    avgOrderValue: record.avgOrderValue,
    competitionLevel: competitionFromIndex(scarcityIndex),
    sellerOpportunity: opportunityLabel(record.winMultiplier),
    winMultiplier: record.winMultiplier,
  };
}

function resolveSellerCategory(seller: SellerProfile): string {
  for (const product of seller.products) {
    const key =
      vendorDesertsData.sellerCategoryMap[
        product.toLowerCase() as keyof typeof vendorDesertsData.sellerCategoryMap
      ];
    if (key) return key;
  }
  return "office_furniture";
}

function estimateTransportCost(
  seller: SellerProfile,
  region: string,
  avgOrderValue: number
): number {
  const originPin =
    vendorDesertsData.originPinByState[
      seller.state as keyof typeof vendorDesertsData.originPinByState
    ] ?? "302001";
  const destPin =
    vendorDesertsData.destPinByRegion[
      region as keyof typeof vendorDesertsData.destPinByRegion
    ] ?? "791001";

  const weightKg = seller.products.some((p) => p.includes("chair")) ? 15 : 25;
  const result = calculateFreight(originPin, destPin, weightKg, "medium", avgOrderValue / 50);
  return result.freightCost;
}

export function getVendorDeserts(): VendorDesert[] {
  return vendorDesertsData.vendorDeserts
    .map(mapDesert)
    .sort((a, b) => b.scarcityIndex - a.scarcityIndex);
}

export function getScarcityByCategory(category?: string): CategoryScarcity[] {
  const items = vendorDesertsData.categoryScarcity;
  const filtered = category
    ? items.filter(
        (item) =>
          item.categoryKey === category ||
          item.category.toLowerCase().includes(category.toLowerCase())
      )
    : items;

  return filtered.map((item) => ({
    ...item,
    scarcityLevel: item.scarcityLevel as ScarcityLevel,
    scarcityIndex: computeScarcityIndex(item.neSellers, item.neBids),
  }));
}

export function getSellerExpansionAdvice(seller?: SellerProfile | null): ExpansionAdvice {
  const profile = seller ?? parseSellers(sellersData)[0];
  const categoryKey = resolveSellerCategory(profile);
  const deserts = getVendorDeserts();

  const categoryMatch = getScarcityByCategory(categoryKey);
  const categoryBoost = categoryMatch[0]?.scarcityLevel === "critical" ? 1.15 : 1;

  const ranked = [...deserts].sort((a, b) => {
    const scoreA = a.scarcityIndex * a.winMultiplier;
    const scoreB = b.scarcityIndex * b.winMultiplier;
    return scoreB - scoreA;
  });

  const top = ranked[0];
  const recommendedRegions = ranked.slice(0, 3).map((d) => d.region);
  const desertRecord = vendorDesertsData.vendorDeserts.find((d) => d.region === top.region)!;
  const transportCost = estimateTransportCost(profile, top.region, top.avgOrderValue);
  const transportPercent = Math.round((transportCost / top.avgOrderValue) * 100);
  const estimatedWinRate = Math.min(
    0.45,
    Math.round(desertRecord.homeStateWinRate * top.winMultiplier * categoryBoost * 100) / 100
  );

  const productLabel = profile.products.slice(0, 2).join(", ");

  return {
    recommendedRegions,
    reason: `${top.sellerCount} sellers, ${top.demandCount} bids/month, ${top.competitionLevel} competition — high scarcity for ${productLabel}`,
    estimatedWinRate,
    estimatedTransportCost: transportCost,
    sellerLocation: `${profile.city}, ${profile.state}`,
    sellerProducts: productLabel,
    topRecommendation: {
      region: top.region,
      sellerCount: top.sellerCount,
      demandCount: top.demandCount,
      winRate: estimatedWinRate,
      transportCost,
      transportPercent,
    },
  };
}

export function getCategoryOptions(): { key: string; label: string }[] {
  return vendorDesertsData.categoryScarcity.map((item) => ({
    key: item.categoryKey,
    label: item.category,
  }));
}

export function scarcityLevelLabel(level: ScarcityLevel | string): string {
  return level.toUpperCase();
}

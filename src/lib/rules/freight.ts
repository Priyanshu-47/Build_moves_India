import freightData from "@/data/freight-rates.json";

export type WeightCategoryId =
  | "documents"
  | "light"
  | "medium"
  | "heavy"
  | "bulky"
  | "oversized";

export type OpportunityLevel = "low" | "medium" | "high" | "critical";

export type FreightBreakdown = {
  baseRate: number;
  distanceCost: number;
  zoneMultiplier: number;
  remoteSurcharge: number;
  total: number;
};

export type FreightResult = {
  productBasePrice: number;
  freightCost: number;
  totalToBuyer: number;
  sellerReceives: number;
  breakdown: FreightBreakdown;
  transitDays: { min: number; max: number };
  recommendation: string;
  distanceKm: number;
  originLabel: string;
  destinationLabel: string;
  routeLabel: string;
};

export type SellerMarginResult = {
  margin: number;
  marginPercent: number;
  isProfitable: boolean;
  riskLevel: "safe" | "caution" | "loss";
};

export type DecoupledPricing = {
  sellerLists: number;
  buyerPays: number;
  sellerReceives: number;
  freightCollected: number;
  transparency: "full";
};

export type RegionalScarcity = {
  region: string;
  sellerCount: number;
  demandScore: number;
  opportunityLevel: OpportunityLevel;
  bidsPerMonth: number;
  winMultiplier: number;
};

type PinRegion = (typeof freightData.pincodeRegions)[number];
type WeightCategory = (typeof freightData.weightCategories)[number];

const ZONE_CENTERS: Record<string, { lat: number; lng: number }> = {
  north: { lat: 28.6, lng: 77.2 },
  south: { lat: 12.9, lng: 77.6 },
  east: { lat: 22.6, lng: 88.4 },
  west: { lat: 19.1, lng: 72.9 },
  northeast: { lat: 26.1, lng: 91.7 },
};

function getWeightCategory(weightKg: number, categoryId?: WeightCategoryId): WeightCategory {
  if (categoryId) {
    const found = freightData.weightCategories.find((cat) => cat.id === categoryId);
    if (found) return found;
  }
  return (
    freightData.weightCategories.find((cat) => weightKg <= cat.maxKg) ??
    freightData.weightCategories[freightData.weightCategories.length - 1]
  );
}

function lookupPin(pin: string): PinRegion & { label: string } {
  const prefix = pin.trim().slice(0, 2);
  const match =
    freightData.pincodeRegions.find((region) => region.prefix === prefix) ??
    freightData.pincodeRegions[0];

  return {
    ...match,
    label: `${match.state} (${pin})`,
  };
}

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function estimateDistance(originPin: string, destPin: string): number {
  const exactRoute = freightData.routeExamples.find(
    (route) =>
      (route.originPin === originPin && route.destPin === destPin) ||
      (route.originPin === destPin && route.destPin === originPin)
  );
  if (exactRoute) return exactRoute.distanceKm;

  const partialRoute = freightData.routeExamples.find(
    (route) =>
      route.originPin.slice(0, 2) === originPin.slice(0, 2) &&
      route.destPin.slice(0, 2) === destPin.slice(0, 2)
  );
  if (partialRoute) return partialRoute.distanceKm;

  const origin = lookupPin(originPin);
  const dest = lookupPin(destPin);
  const originCenter = ZONE_CENTERS[origin.zone] ?? ZONE_CENTERS.north;
  const destCenter = ZONE_CENTERS[dest.zone] ?? ZONE_CENTERS.north;
  const roadFactor = 1.35;
  return Math.round(haversineKm(originCenter.lat, originCenter.lng, destCenter.lat, destCenter.lng) * roadFactor);
}

function getZoneMultiplier(origin: PinRegion, dest: PinRegion): {
  multiplier: number;
  remoteSurcharge: number;
  zoneType: string;
} {
  if (dest.remote === "remote_island" || origin.remote === "remote_island") {
    return {
      multiplier: freightData.zoneMultipliers.remote_island,
      remoteSurcharge: 0.3,
      zoneType: "remote_island",
    };
  }

  if (dest.remote === "remote_jk_ladakh" || origin.remote === "remote_jk_ladakh") {
    return {
      multiplier: freightData.zoneMultipliers.remote_jk_ladakh,
      remoteSurcharge: 0.25,
      zoneType: "remote_jk_ladakh",
    };
  }

  if (dest.remote === "remote_northeast" || origin.remote === "remote_northeast") {
    return {
      multiplier: freightData.zoneMultipliers.remote_northeast,
      remoteSurcharge: 0.2,
      zoneType: "remote_northeast",
    };
  }

  if (origin.state === dest.state) {
    return {
      multiplier: freightData.zoneMultipliers.same_state,
      remoteSurcharge: 0,
      zoneType: "same_state",
    };
  }

  const adjacent =
    freightData.adjacentStates[origin.state as keyof typeof freightData.adjacentStates]?.includes(
      dest.state
    ) ?? false;
  if (adjacent) {
    return {
      multiplier: freightData.zoneMultipliers.adjacent_state,
      remoteSurcharge: 0,
      zoneType: "adjacent_state",
    };
  }

  if (origin.zone === dest.zone) {
    return {
      multiplier: freightData.zoneMultipliers.zone_same,
      remoteSurcharge: 0,
      zoneType: "zone_same",
    };
  }

  return {
    multiplier: freightData.zoneMultipliers.zone_different,
    remoteSurcharge: 0,
    zoneType: "zone_different",
  };
}

function getTransitDays(distanceKm: number): { min: number; max: number } {
  const band = freightData.transitTimeByDistance.find((entry) => distanceKm <= entry.maxKm);
  return band
    ? { min: band.minDays, max: band.maxDays }
    : { min: 7, max: 12 };
}

function getProductPrice(category: string): number {
  const key = category as keyof typeof freightData.defaultProductPrices;
  return freightData.defaultProductPrices[key] ?? 1500;
}

export function calculateFreight(
  originPin: string,
  destinationPin: string,
  weightKg: number,
  category: WeightCategoryId | string = "light",
  productPrice?: number
): FreightResult {
  const origin = lookupPin(originPin);
  const dest = lookupPin(destinationPin);
  const weightCategory = getWeightCategory(weightKg, category as WeightCategoryId);
  const distanceKm = estimateDistance(originPin, destinationPin);
  const zone = getZoneMultiplier(origin, dest);

  const baseRate = weightCategory.baseRate;
  const distanceCost = Math.round(distanceKm * weightCategory.perKm);
  const subtotal = baseRate + distanceCost;
  const remoteSurcharge = Math.round(subtotal * zone.remoteSurcharge);
  const freightCost = Math.round((subtotal + remoteSurcharge) * zone.multiplier);

  const exactRoute = freightData.routeExamples.find(
    (route) => route.originPin === originPin && route.destPin === destinationPin
  );
  const adjustedFreight = exactRoute?.freightCost ?? freightCost;

  const productBasePrice = productPrice ?? getProductPrice(category);
  const totalToBuyer = productBasePrice + adjustedFreight;
  const transitDays = getTransitDays(distanceKm);

  let recommendation: string;
  if (zone.zoneType === "remote_northeast" || zone.zoneType === "remote_jk_ladakh") {
    recommendation =
      "Remote region — use decoupled pricing. Partner with India Post or regional 3PL. Seller margin is protected when freight is shown separately.";
  } else if (distanceKm > 2000) {
    recommendation =
      "Long-haul route — decouple freight to avoid inclusive-pricing losses. Consider hub-and-spoke via nearest metro.";
  } else if (zone.zoneType === "same_state") {
    recommendation = "Same-state delivery — competitive freight. Good for building rating with low logistics risk.";
  } else {
    recommendation =
      "Standard inter-state route — decoupled model ensures seller receives full product price regardless of freight variance.";
  }

  return {
    productBasePrice,
    freightCost: adjustedFreight,
    totalToBuyer,
    sellerReceives: productBasePrice,
    breakdown: {
      baseRate,
      distanceCost,
      zoneMultiplier: zone.multiplier,
      remoteSurcharge,
      total: adjustedFreight,
    },
    transitDays,
    recommendation,
    distanceKm,
    originLabel: origin.state,
    destinationLabel: dest.state,
    routeLabel: `${origin.state} → ${dest.state}`,
  };
}

export function getSellerMargin(
  productPrice: number,
  freightCost: number,
  buyerPays: number,
  inclusiveFreightGuess = 0
): SellerMarginResult {
  const decoupledMargin = productPrice;
  const oldModelFreightAbsorbed = Math.max(0, freightCost - inclusiveFreightGuess);
  const oldModelSellerReceives = productPrice - oldModelFreightAbsorbed;
  const margin = decoupledMargin;
  const marginPercent = buyerPays > 0 ? Math.round((margin / buyerPays) * 100) : 0;

  let riskLevel: SellerMarginResult["riskLevel"];
  if (oldModelSellerReceives >= productPrice * 0.9) {
    riskLevel = "safe";
  } else if (oldModelSellerReceives >= productPrice * 0.5) {
    riskLevel = "caution";
  } else {
    riskLevel = "loss";
  }

  return {
    margin,
    marginPercent,
    isProfitable: margin > 0,
    riskLevel,
  };
}

export function getDecoupledPricing(
  productPrice: number,
  freightCost: number
): DecoupledPricing {
  return {
    sellerLists: productPrice,
    buyerPays: productPrice + freightCost,
    sellerReceives: productPrice,
    freightCollected: freightCost,
    transparency: "full",
  };
}

export function getRegionalScarcity(
  _category?: string
): RegionalScarcity[] {
  return freightData.regionalScarcity.map((entry) => ({
    region: entry.region,
    sellerCount: entry.sellerCount,
    demandScore: Math.round((entry.bidsPerMonth / Math.max(entry.sellerCount, 1)) * 10),
    opportunityLevel: entry.opportunityLevel as OpportunityLevel,
    bidsPerMonth: entry.bidsPerMonth,
    winMultiplier: entry.winMultiplier,
  }));
}

export function getWeightCategoryOptions(): { id: string; label: string }[] {
  return freightData.weightCategories.map((cat) => ({
    id: cat.id,
    label: cat.label,
  }));
}

export function getOldModelLoss(
  productPrice: number,
  actualFreight: number,
  guessedFreight: number
): number {
  return Math.max(0, actualFreight - guessedFreight);
}

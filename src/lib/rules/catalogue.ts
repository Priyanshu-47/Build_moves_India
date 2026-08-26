import hsnData from "@/data/hsn-codes.json";
import { CheckStatus, SellerProfile } from "@/lib/schemas";

export type HsnCategory = (typeof hsnData.categories)[number];

export type CatalogueImage = {
  id: string;
  name: string;
  width: number;
  height: number;
  whiteBackground: boolean;
};

export type CatalogueSpecs = Record<string, string>;

export type CatalogueCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
};

export type CatalogueBlocker = {
  code: string;
  message: string;
};

export type CatalogueComplianceResult = {
  score: number;
  checks: CatalogueCheck[];
  blockers: CatalogueBlocker[];
  readyToList: boolean;
};

export type CatalogueDraft = {
  productName: string;
  categoryId: string;
  categoryPath: string[];
  hsnCode: string;
  hsnDisplay: string;
  gstRate: number;
  bisRequired: boolean;
  goldenParameters: CatalogueSpecs;
  priceRange: { min: number; max: number };
  brandName: string;
  sellerCertifications: string[];
  rejectionReasons: HsnCategory["rejectionReasons"];
};

const MIN_IMAGE_SIZE = 800;
const MIN_IMAGE_COUNT = 3;

function normalizeText(value: string): string {
  return value.toLowerCase().trim();
}

export function getAllCategories(): HsnCategory[] {
  return hsnData.categories;
}

export function findCategoryByProductName(productName: string): HsnCategory | null {
  const normalized = normalizeText(productName);
  if (!normalized) return null;

  const exact = hsnData.categories.find((category) =>
    category.productNames.some((name) => normalizeText(name) === normalized)
  );
  if (exact) return exact;

  return (
    hsnData.categories.find((category) =>
      category.productNames.some(
        (name) =>
          normalized.includes(normalizeText(name)) ||
          normalizeText(name).includes(normalized)
      )
    ) ?? null
  );
}

export function suggestCategory(productName: string): HsnCategory | null {
  const normalized = normalizeText(productName);
  if (!normalized) return null;

  let best: { category: HsnCategory; score: number } | null = null;

  for (const category of hsnData.categories) {
    for (const name of category.productNames) {
      const nameNorm = normalizeText(name);
      let score = 0;
      if (normalized === nameNorm) score = 100;
      else if (normalized.includes(nameNorm) || nameNorm.includes(normalized)) score = 80;
      else {
        const words = nameNorm.split(/\s+/);
        const hits = words.filter((word) => word.length > 2 && normalized.includes(word));
        score = hits.length > 0 ? (hits.length / words.length) * 60 : 0;
      }
      if (!best || score > best.score) {
        best = { category, score };
      }
    }
  }

  return best && best.score >= 40 ? best.category : null;
}

export function generateCatalogueDraft(
  productName: string,
  seller: SellerProfile
): CatalogueDraft | null {
  const category = suggestCategory(productName);
  if (!category) return null;

  return {
    productName: productName.trim(),
    categoryId: category.id,
    categoryPath: category.categoryPath,
    hsnCode: category.hsnCode,
    hsnDisplay: category.hsnDisplay,
    gstRate: category.gstRate,
    bisRequired: category.bisRequired,
    goldenParameters: Object.fromEntries(
      Object.entries(category.goldenParameters).map(([key, value]) => [key, String(value)])
    ),
    priceRange: { ...category.priceRange },
    brandName: seller.businessName,
    sellerCertifications: seller.certifications,
    rejectionReasons: category.rejectionReasons,
  };
}

function hasCertification(sellerCerts: string[], needle: string): boolean {
  const norm = normalizeText(needle);
  return sellerCerts.some((cert) => normalizeText(cert).includes(norm));
}

function checkWeight(status: CheckStatus): number {
  if (status === "pass") return 1;
  if (status === "warn") return 0.5;
  return 0;
}

export function checkCatalogueCompliance(
  productName: string,
  specs: CatalogueSpecs,
  images: CatalogueImage[],
  options: {
    hsnCode?: string;
    gstRate?: number;
    unitPrice?: number;
    bisRequired?: boolean;
    sellerCertifications?: string[];
    priceRange?: { min: number; max: number };
    expectedParameters?: Record<string, string>;
  } = {}
): CatalogueComplianceResult {
  const category = suggestCategory(productName);
  const checks: CatalogueCheck[] = [];
  const blockers: CatalogueBlocker[] = [];

  const expectedHsn = options.hsnCode ?? category?.hsnCode ?? "";
  const expectedGst = options.gstRate ?? category?.gstRate ?? 18;
  const expectedParams = options.expectedParameters ?? category?.goldenParameters ?? {};
  const priceRange = options.priceRange ?? category?.priceRange;
  const bisRequired = options.bisRequired ?? category?.bisRequired ?? false;
  const sellerCerts = options.sellerCertifications ?? [];

  // HSN check
  const hsnValid = Boolean(expectedHsn && expectedHsn.length >= 4);
  checks.push({
    id: "hsn_valid",
    label: "HSN code",
    status: hsnValid ? "pass" : "fail",
    message: hsnValid
      ? `HSN ${expectedHsn} mapped correctly for this category.`
      : "Valid HSN code is required for catalogue listing.",
  });
  if (!hsnValid) {
    blockers.push({ code: "HSN_INVALID", message: "HSN code missing or invalid." });
  }

  // GST check
  const gstValid = expectedGst === 18 || expectedGst === 12 || expectedGst === 5;
  checks.push({
    id: "gst_rate",
    label: "GST rate",
    status: gstValid ? "pass" : "fail",
    message: gstValid
      ? `GST ${expectedGst}% matches furniture category slab.`
      : "GST rate does not match expected category slab.",
  });
  if (!gstValid) {
    blockers.push({ code: "GST_INVALID", message: "Incorrect GST rate for product category." });
  }

  // Golden parameters
  const paramKeys = Object.keys(expectedParams);
  const filledParams = paramKeys.filter((key) => specs[key]?.trim().length > 0);
  const paramRatio = paramKeys.length > 0 ? filledParams.length / paramKeys.length : 0;
  const paramStatus: CheckStatus =
    paramRatio === 1 ? "pass" : paramRatio >= 0.7 ? "warn" : "fail";
  checks.push({
    id: "golden_parameters",
    label: "Golden parameters",
    status: paramStatus,
    message:
      paramStatus === "pass"
        ? "All golden parameters are filled."
        : `${filledParams.length}/${paramKeys.length} parameters filled — incomplete specs cause rejection.`,
  });
  if (paramStatus === "fail") {
    blockers.push({
      code: "PARAMS_INCOMPLETE",
      message: "Golden parameters incomplete for GeM catalogue stage 4.",
    });
  }

  // BIS check
  if (bisRequired) {
    const hasBis = hasCertification(sellerCerts, "bis");
    checks.push({
      id: "bis_required",
      label: "BIS certification",
      status: hasBis ? "pass" : "fail",
      message: hasBis
        ? "BIS certificate on file for this category."
        : "BIS certificate required — 33% of first-time listings fail here.",
    });
    if (!hasBis) {
      blockers.push({
        code: "BIS_MISSING",
        message: "BIS certification required for this product category.",
      });
    }
  } else {
    checks.push({
      id: "bis_required",
      label: "BIS certification",
      status: "pass",
      message: "BIS not mandatory for this sub-category.",
    });
  }

  // Image count
  const imageCountOk = images.length >= MIN_IMAGE_COUNT;
  checks.push({
    id: "image_count",
    label: "Image count (3+)",
    status: imageCountOk ? "pass" : "fail",
    message: imageCountOk
      ? `${images.length} images uploaded.`
      : `Only ${images.length} images — GeM requires minimum ${MIN_IMAGE_COUNT}.`,
  });
  if (!imageCountOk) {
    blockers.push({
      code: "IMAGE_COUNT",
      message: `Upload at least ${MIN_IMAGE_COUNT} product images.`,
    });
  }

  // Image resolution
  const resolutionOk = images.every(
    (img) => img.width >= MIN_IMAGE_SIZE && img.height >= MIN_IMAGE_SIZE
  );
  checks.push({
    id: "image_resolution",
    label: "Image resolution (800×800)",
    status: images.length === 0 ? "fail" : resolutionOk ? "pass" : "fail",
    message: resolutionOk
      ? "All images meet 800×800px minimum."
      : "One or more images below 800×800px resolution.",
  });
  if (images.length > 0 && !resolutionOk) {
    blockers.push({
      code: "IMAGE_RESOLUTION",
      message: "Images must be at least 800×800 pixels.",
    });
  }

  // White background
  const whiteBgOk = images.length > 0 && images.every((img) => img.whiteBackground);
  checks.push({
    id: "image_background",
    label: "White background",
    status: images.length === 0 ? "fail" : whiteBgOk ? "pass" : "fail",
    message: whiteBgOk
      ? "All images have compliant white backgrounds."
      : "GeM requires white background — lifestyle photos are rejected.",
  });
  if (images.length > 0 && !whiteBgOk) {
    blockers.push({
      code: "IMAGE_BACKGROUND",
      message: "Product images must use white background.",
    });
  }

  // Price range
  if (options.unitPrice !== undefined && priceRange) {
    const price = options.unitPrice;
    let priceStatus: CheckStatus = "pass";
    let priceMessage = `₹${price.toLocaleString("en-IN")} is within market range.`;

    if (price < priceRange.min * 0.85) {
      priceStatus = "fail";
      priceMessage = `Price too low — below ₹${priceRange.min.toLocaleString("en-IN")} raises quality flags.`;
      blockers.push({ code: "PRICE_LOW", message: priceMessage });
    } else if (price > priceRange.max * 1.15) {
      priceStatus = "warn";
      priceMessage = `Price above typical range (₹${priceRange.max.toLocaleString("en-IN")}).`;
    } else if (price < priceRange.min) {
      priceStatus = "warn";
      priceMessage = `Slightly below comparable range (₹${priceRange.min.toLocaleString("en-IN")}–₹${priceRange.max.toLocaleString("en-IN")}).`;
    }

    checks.push({
      id: "price_range",
      label: "Price validation",
      status: priceStatus,
      message: priceMessage,
    });
  } else {
    checks.push({
      id: "price_range",
      label: "Price validation",
      status: "warn",
      message: "Set a unit price to validate against market comparables.",
    });
  }

  const totalWeight = checks.length;
  const earned = checks.reduce((sum, check) => sum + checkWeight(check.status), 0);
  const score = Math.round((earned / totalWeight) * 100);
  const hasCritical = blockers.length > 0;

  return {
    score,
    checks,
    blockers,
    readyToList: score >= 80 && !hasCritical,
  };
}

export function getPriceRangeForProduct(productName: string): {
  min: number;
  max: number;
} | null {
  const category = suggestCategory(productName);
  return category ? { ...category.priceRange } : null;
}

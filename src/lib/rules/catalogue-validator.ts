import comparablesData from "@/data/comparables.json";
import {
  CatalogueImage,
  HsnCategory,
  findCategoryByProductName,
  getAllCategories,
  suggestCategory,
} from "@/lib/rules/catalogue";

export type CatalogueProduct = {
  name: string;
  categoryPath: string[];
  categoryId?: string;
  goldenParameters: Record<string, string>;
  pricePerUnit: number;
  quantity: number;
  bisCertNumber?: string;
  modelNumber?: string;
  images: CatalogueImage[];
};

export type CategoryValidation = {
  valid: boolean;
  correctCategory: string[];
  suggestions: string[];
  message: string;
};

export type GoldenParameterValidation = {
  complete: boolean;
  missing: string[];
  descriptions: Record<string, string>;
  message: string;
};

export type ImageValidation = {
  compliant: boolean;
  issues: string[];
  message: string;
};

export type PriceValidation = {
  reasonable: boolean;
  range: { min: number; max: number };
  comparables: { title: string; price: number; department: string }[];
  percentFromMarket: number;
  message: string;
};

export type BISValidation = {
  required: boolean;
  present: boolean;
  correctModel: boolean;
  message: string;
};

export type CompleteValidation = {
  score: number;
  issues: string[];
  blockers: string[];
  readiness: "ready" | "fix" | "major";
  readinessLabel: string;
};

export type CommonRejection = {
  reason: string;
  howToFix: string;
};

const MIN_IMAGE_SIZE = 800;
const MIN_IMAGE_COUNT = 3;

function pathsMatch(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((segment, index) => segment === b[index]);
}

function pathLabel(path: string[]): string {
  return path.join(" > ");
}

function getCategoryByPath(path: string[]): HsnCategory | null {
  return (
    getAllCategories().find((category) => pathsMatch(category.categoryPath, path)) ?? null
  );
}

function getCategoryById(id: string): HsnCategory | null {
  return getAllCategories().find((category) => category.id === id) ?? null;
}

function resolveCategory(product: CatalogueProduct): HsnCategory | null {
  if (product.categoryId) {
    return getCategoryById(product.categoryId);
  }
  if (product.categoryPath.length > 0) {
    return getCategoryByPath(product.categoryPath);
  }
  return suggestCategory(product.name) ?? findCategoryByProductName(product.name);
}

function humanizeKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export function validateCategory(
  product: Pick<CatalogueProduct, "name" | "categoryPath" | "categoryId">
): CategoryValidation {
  const suggested =
    suggestCategory(product.name) ?? findCategoryByProductName(product.name);
  const selected = resolveCategory({
    name: product.name,
    categoryPath: product.categoryPath,
    categoryId: product.categoryId,
    goldenParameters: {},
    pricePerUnit: 0,
    quantity: 0,
    images: [],
  });

  if (!product.name.trim()) {
    return {
      valid: false,
      correctCategory: suggested?.categoryPath ?? [],
      suggestions: [],
      message: "Enter a product name to validate category mapping.",
    };
  }

  if (!selected) {
    return {
      valid: false,
      correctCategory: suggested?.categoryPath ?? [],
      suggestions: suggested ? [pathLabel(suggested.categoryPath)] : [],
      message: suggested
        ? `Select a category. Suggested: ${pathLabel(suggested.categoryPath)}`
        : "Could not determine category — check product name spelling.",
    };
  }

  const correctCategory = suggested?.categoryPath ?? selected.categoryPath;
  const valid = suggested ? pathsMatch(selected.categoryPath, suggested.categoryPath) : true;

  const suggestions: string[] = [];
  if (!valid && suggested) {
    suggestions.push(pathLabel(suggested.categoryPath));
    getAllCategories()
      .filter(
        (category) =>
          category.id !== suggested.id &&
          category.categoryPath[0] === suggested.categoryPath[0]
      )
      .slice(0, 2)
      .forEach((category) => suggestions.push(pathLabel(category.categoryPath)));
  }

  return {
    valid,
    correctCategory,
    suggestions,
    message: valid
      ? `Category correct: ${pathLabel(selected.categoryPath)}`
      : `This product should be listed under ${pathLabel(correctCategory)}`,
  };
}

export function validateGoldenParameters(
  category: HsnCategory | null,
  params: Record<string, string>
): GoldenParameterValidation {
  if (!category) {
    return {
      complete: false,
      missing: [],
      descriptions: {},
      message: "Select a valid category to validate golden parameters.",
    };
  }

  const descriptions = Object.fromEntries(
    Object.entries(category.goldenParameters).map(([key, value]) => [
      humanizeKey(key),
      `Expected example: ${value}`,
    ])
  );

  const missing = Object.keys(category.goldenParameters).filter(
    (key) => !params[key]?.trim()
  );

  const complete = missing.length === 0;

  return {
    complete,
    missing: missing.map(humanizeKey),
    descriptions,
    message: complete
      ? "All golden parameters filled."
      : `Missing: ${missing.map(humanizeKey).join(", ")} (required)`,
  };
}

export function validateImages(images: CatalogueImage[]): ImageValidation {
  const issues: string[] = [];

  if (images.length === 0) {
    return {
      compliant: false,
      issues: ["No images uploaded"],
      message: "Upload at least 3 product images.",
    };
  }

  if (images.length < MIN_IMAGE_COUNT) {
    issues.push(`Only ${images.length} images — minimum ${MIN_IMAGE_COUNT} required`);
  }

  for (const image of images) {
    if (image.width < MIN_IMAGE_SIZE || image.height < MIN_IMAGE_SIZE) {
      issues.push(
        `${image.name}: ${image.width}×${image.height}px — must be ${MIN_IMAGE_SIZE}×${MIN_IMAGE_SIZE}px`
      );
    }
    if (!image.whiteBackground) {
      issues.push(`${image.name}: background must be white`);
    }
  }

  const firstBad = images.find(
    (img) => img.width < MIN_IMAGE_SIZE || img.height < MIN_IMAGE_SIZE || !img.whiteBackground
  );

  const compliant = issues.length === 0;

  let message: string;
  if (compliant) {
    message = `All ${images.length} images meet GeM specs (800×800px, white background).`;
  } else if (firstBad) {
    message = `Images must be 800×800px, white background. Current: ${firstBad.width}×${firstBad.height}px${firstBad.whiteBackground ? "" : ", non-white background"} ✗`;
  } else {
    message = issues.join("; ");
  }

  return { compliant, issues, message };
}

export function validatePrice(
  price: number,
  category: HsnCategory | null,
  quantity: number
): PriceValidation {
  const range = category?.priceRange ?? { min: 3000, max: 5000 };

  const comparables = comparablesData
    .filter((item) =>
      category
        ? pathsMatch(item.categoryPath, category.categoryPath)
        : true
    )
    .slice(0, 4)
    .map((item) => ({
      title: item.title,
      price: item.awardedPrice,
      department: item.department,
    }));

  if (comparables.length > 0) {
    const prices = comparables.map((item) => item.price);
    range.min = Math.min(...prices, range.min);
    range.max = Math.max(...prices, range.max);
  }

  const midMarket = (range.min + range.max) / 2;
  const percentFromMarket =
    midMarket > 0 ? Math.round(((price - midMarket) / midMarket) * 100) : 0;

  const reasonable =
    price >= range.min * 0.85 && price <= range.max * 1.15;

  let message: string;
  if (!price || price <= 0) {
    message = "Enter a unit price to validate against market comparables.";
  } else if (price > range.max) {
    message = `Similar products: ₹${range.min.toLocaleString("en-IN")}–${range.max.toLocaleString("en-IN")}. Your price: ₹${price.toLocaleString("en-IN")} (${Math.abs(percentFromMarket)}% above market)`;
  } else if (price < range.min) {
    message = `Price ₹${price.toLocaleString("en-IN")} is below market floor ₹${range.min.toLocaleString("en-IN")} — may trigger quality review.`;
  } else {
    message = `Price ₹${price.toLocaleString("en-IN")} is within market range (qty ${quantity || "—"}).`;
  }

  return {
    reasonable,
    range,
    comparables,
    percentFromMarket,
    message,
  };
}

export function validateBIS(
  product: Pick<CatalogueProduct, "name" | "bisCertNumber" | "modelNumber">,
  bisCert: string | undefined,
  category: HsnCategory | null
): BISValidation {
  const required = category?.bisRequired ?? false;
  const certNumber = (bisCert ?? product.bisCertNumber ?? "").trim();
  const present = certNumber.length >= 8;
  const modelNumber = (product.modelNumber ?? product.name).trim();

  const bisPattern = /^[A-Z0-9][A-Z0-9/-]{6,}$/i;
  const correctModel =
    present &&
    (certNumber.toLowerCase().includes(modelNumber.toLowerCase().slice(0, 4)) ||
      bisPattern.test(certNumber));

  let message: string;
  if (!required) {
    message = "BIS not required for this category.";
  } else if (!present) {
    message =
      "BIS required for this category. Certificate must match exact model number.";
  } else if (!correctModel) {
    message =
      "BIS certificate on file but model number may not match — verify ISI mark matches product model.";
  } else {
    message = `BIS certificate ${certNumber} looks valid for this model.`;
  }

  return { required, present, correctModel, message };
}

function checkWeight(passed: boolean, warning = false): number {
  if (passed) return 1;
  if (warning) return 0.5;
  return 0;
}

export function validateComplete(product: CatalogueProduct): CompleteValidation {
  const category = resolveCategory(product);
  const categoryResult = validateCategory(product);
  const paramsResult = validateGoldenParameters(category, product.goldenParameters);
  const imageResult = validateImages(product.images);
  const priceResult = validatePrice(product.pricePerUnit, category, product.quantity);
  const bisResult = validateBIS(product, product.bisCertNumber, category);

  const issues: string[] = [];
  const blockers: string[] = [];

  if (!categoryResult.valid) {
    issues.push(categoryResult.message);
    blockers.push("Wrong category selected");
  }
  if (!paramsResult.complete) {
    issues.push(paramsResult.message);
    blockers.push("Incomplete golden parameters");
  }
  if (!imageResult.compliant) {
    issues.push(imageResult.message);
    blockers.push("Image compliance failed");
  }
  if (!priceResult.reasonable && product.pricePerUnit > 0) {
    issues.push(priceResult.message);
    if (product.pricePerUnit > priceResult.range.max * 1.15) {
      blockers.push("Price far above market");
    }
  }
  if (bisResult.required && !bisResult.present) {
    issues.push(bisResult.message);
    blockers.push("BIS certificate missing");
  }
  if (bisResult.required && bisResult.present && !bisResult.correctModel) {
    issues.push(bisResult.message);
  }

  const weights = [
    checkWeight(categoryResult.valid),
    checkWeight(paramsResult.complete),
    checkWeight(imageResult.compliant),
    checkWeight(
      priceResult.reasonable || product.pricePerUnit <= 0,
      product.pricePerUnit > 0 && !priceResult.reasonable
    ),
    checkWeight(!bisResult.required || (bisResult.present && bisResult.correctModel)),
  ];

  const score = Math.round(
    (weights.reduce((sum, weight) => sum + weight, 0) / weights.length) * 100
  );

  let readiness: CompleteValidation["readiness"];
  let readinessLabel: string;
  if (score >= 80 && blockers.length === 0) {
    readiness = "ready";
    readinessLabel = "Ready to submit";
  } else if (score >= 50) {
    readiness = "fix";
    readinessLabel = "Fix these issues";
  } else {
    readiness = "major";
    readinessLabel = "Major issues found";
  }

  return { score, issues, blockers, readiness, readinessLabel };
}

export function getCommonRejections(category: HsnCategory | null): CommonRejection[] {
  if (!category) {
    return [
      {
        reason: "Wrong category selected",
        howToFix: "Map product to the correct GeM taxonomy before submitting.",
      },
    ];
  }

  const reasons = category.rejectionReasons;
  return [
    { reason: "Category mismatch", howToFix: reasons.product },
    { reason: "HSN code error", howToFix: reasons.hsn },
    { reason: "Incomplete golden parameters", howToFix: reasons.parameters },
    { reason: "Image non-compliance", howToFix: reasons.images },
    { reason: "Pricing flags", howToFix: reasons.pricing },
  ];
}

export function listCategoryOptions(): {
  id: string;
  label: string;
  path: string[];
}[] {
  return getAllCategories().map((category) => ({
    id: category.id,
    label: pathLabel(category.categoryPath),
    path: category.categoryPath,
  }));
}

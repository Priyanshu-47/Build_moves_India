import { z } from "zod";

// --- Shared primitives ---

export const BlockerCodeSchema = z.enum([
  "BIS_MISSING",
  "NAME_MISMATCH",
  "CAUTION_MONEY",
  "CAPACITY_LOW",
  "LOCATION_FAR",
  "EMD_REQUIRED",
  "CATEGORY_WRONG",
  "IMAGE_SPECS",
  "DEADLINE_SOON",
]);

export const MseCategorySchema = z.enum(["micro", "small", "medium"]);

export const BidStatusSchema = z.enum(["open", "closing_soon"]);

export const CheckStatusSchema = z.enum(["pass", "fail", "warn"]);

export const CurrencySchema = z.literal("INR");

export const LanguageSchema = z.enum(["hi", "en", "hinglish"]);

export const PaymentStatusSchema = z.enum(["paid", "pending", "stuck", "overdue"]);

// --- Location ---

export const LocationSchema = z.object({
  state: z.string(),
  city: z.string(),
});

// --- Seller ---

export const SellerProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  businessName: z.string(),
  city: z.string(),
  state: z.string(),
  products: z.array(z.string()),
  monthlyCapacity: z.number().positive(),
  certifications: z.array(z.string()),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  mseCategory: MseCategorySchema.optional(),
  cautionMoneyPaid: z.boolean(),
  bankVerified: z.boolean(),
});

export const SellersFileSchema = z.array(SellerProfileSchema);

// --- Bid opportunity ---

export const BidOpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  department: z.string(),
  location: LocationSchema,
  categoryPath: z.array(z.string()).min(1),
  quantity: z.number().positive(),
  unit: z.string(),
  estimatedValue: z.number().positive(),
  deadline: z.string(),
  emdAmount: z.number().nonnegative().optional(),
  mseReserved: z.boolean(),
  requiredCertifications: z.array(z.string()),
  goldenParameters: z.record(z.string(), z.string()),
  evaluationCriteria: z.array(z.string()),
  deliveryDays: z.number().positive(),
  status: BidStatusSchema,
});

export const BidsFileSchema = z.array(BidOpportunitySchema);

// --- Payment tracking ---

export const PaymentOrderSchema = z.object({
  id: z.string(),
  bidTitle: z.string(),
  department: z.string(),
  totalValue: z.number().positive(),
  orderDate: z.string(),
  deliveryDate: z.string(),
  cracGenerated: z.boolean(),
  cracDate: z.string().nullable(),
  invoiceDate: z.string().nullable(),
  paymentDate: z.string().nullable(),
  status: PaymentStatusSchema,
});

export const PaymentsFileSchema = z.array(PaymentOrderSchema);

// --- Blockers & warnings ---

export const BlockerSchema = z.object({
  code: BlockerCodeSchema,
  message: z.string(),
  severity: z.enum(["critical", "warning"]).default("critical"),
});

export const WarningSchema = z.object({
  code: z.string(),
  message: z.string(),
});

// --- Match result ---

export const MatchDimensionsSchema = z.object({
  product: z.number().min(0).max(100),
  location: z.number().min(0).max(100),
  capacity: z.number().min(0).max(100),
  eligibility: z.number().min(0).max(100),
  certifications: z.number().min(0).max(100),
});

export const MatchResultSchema = z.object({
  bidId: z.string(),
  matchScore: z.number().min(0).max(100),
  dimensions: MatchDimensionsSchema,
  blockers: z.array(BlockerSchema),
  warnings: z.array(WarningSchema),
  pursue: z.boolean(),
});

// --- Readiness ---

export const ReadinessCheckSchema = z.object({
  id: z.string(),
  label: z.string(),
  status: CheckStatusSchema,
  weight: z.number().positive(),
  message: z.string().optional(),
});

export const ReadinessResultSchema = z.object({
  bidId: z.string(),
  readinessScore: z.number().min(0).max(100),
  checks: z.array(ReadinessCheckSchema),
  blockers: z.array(BlockerSchema),
});

// --- Price intelligence ---

export const ComparablePurchaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  department: z.string(),
  date: z.string(),
  awardedPrice: z.number().positive(),
  quantity: z.number().positive(),
  unit: z.string(),
  categoryPath: z.array(z.string()).min(1),
});

export const ComparablesFileSchema = z.array(ComparablePurchaseSchema);

export const PriceRangeSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
  currency: CurrencySchema,
});

export const RecommendedRangeSchema = z.object({
  low: z.number().nonnegative(),
  high: z.number().nonnegative(),
});

export const EstimatedMarginSchema = z.object({
  amount: z.number(),
  percent: z.number(),
});

export const PriceIntelligenceSchema = z.object({
  bidId: z.string(),
  comparableRange: PriceRangeSchema,
  recommendedRange: RecommendedRangeSchema,
  estimatedMargin: EstimatedMarginSchema,
  comparables: z.array(ComparablePurchaseSchema),
  guidance: z.string(),
});

// --- Bid preparation ---

export const ChecklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  completed: z.boolean(),
  required: z.boolean(),
});

export const PricingSummarySchema = z.object({
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  currency: CurrencySchema,
});

export const BidPreparationSchema = z.object({
  bidId: z.string(),
  checklist: z.array(ChecklistItemSchema),
  generatedDocuments: z.array(z.string()),
  pricingSummary: PricingSummarySchema,
  deliveryCommitment: z.string(),
  readyToSubmit: z.boolean(),
});

// --- Category taxonomy ---

export interface CategoryNode {
  id: string;
  name: string;
  code: string;
  hsnCode?: string;
  children?: CategoryNode[];
}

export const CategoryNodeSchema: z.ZodType<CategoryNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    code: z.string(),
    hsnCode: z.string().optional(),
    children: z.array(CategoryNodeSchema).optional(),
  })
);

export const CategoriesFileSchema = CategoryNodeSchema;

// --- API payloads ---

export const ExplainTypeSchema = z.enum([
  "match",
  "bid",
  "readiness",
  "pricing",
  "checklist",
]);

export const ExplainRequestSchema = z.object({
  type: ExplainTypeSchema,
  bidId: z.string(),
  seller: SellerProfileSchema,
  ruleOutput: z.record(z.string(), z.unknown()),
  language: LanguageSchema.optional(),
});

// --- Inferred types ---

export type BlockerCode = z.infer<typeof BlockerCodeSchema>;
export type MseCategory = z.infer<typeof MseCategorySchema>;
export type BidStatus = z.infer<typeof BidStatusSchema>;
export type CheckStatus = z.infer<typeof CheckStatusSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type SellerProfile = z.infer<typeof SellerProfileSchema>;
export type BidOpportunity = z.infer<typeof BidOpportunitySchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
export type PaymentOrder = z.infer<typeof PaymentOrderSchema>;
export type Blocker = z.infer<typeof BlockerSchema>;
export type Warning = z.infer<typeof WarningSchema>;
export type MatchDimensions = z.infer<typeof MatchDimensionsSchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;
export type ReadinessCheck = z.infer<typeof ReadinessCheckSchema>;
export type ReadinessResult = z.infer<typeof ReadinessResultSchema>;
export type ComparablePurchase = z.infer<typeof ComparablePurchaseSchema>;
export type PriceIntelligence = z.infer<typeof PriceIntelligenceSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type PricingSummary = z.infer<typeof PricingSummarySchema>;
export type BidPreparation = z.infer<typeof BidPreparationSchema>;
export type ExplainRequest = z.infer<typeof ExplainRequestSchema>;

// --- Parse helpers ---

export function parseSellers(data: unknown): SellerProfile[] {
  return SellersFileSchema.parse(data);
}

export function parseBids(data: unknown): BidOpportunity[] {
  return BidsFileSchema.parse(data);
}

export function parsePayments(data: unknown): PaymentOrder[] {
  return PaymentsFileSchema.parse(data);
}

export function parseComparables(data: unknown): ComparablePurchase[] {
  return ComparablesFileSchema.parse(data);
}

export function parseCategories(data: unknown): CategoryNode {
  return CategoriesFileSchema.parse(data);
}

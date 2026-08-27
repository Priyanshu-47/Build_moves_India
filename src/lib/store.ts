import { SellerProfile, SellerProfileSchema, MseCategory } from "@/lib/schemas";

const STORAGE_KEY = "sahayak-seller";
const SETUP_DRAFT_KEY = "sahayak-setup-draft";

export type SetupDraftData = {
  businessName: string;
  name: string;
  city: string;
  state: string;
  products: string;
  monthlyCapacity: string;
  primaryCategory: string;
  certifications: string[];
  mseCategory: MseCategory;
  udyamNumber: string;
  gstin: string;
  pan: string;
  bankAccount: string;
  ifsc: string;
  email: string;
};

export type SetupDraft = {
  step: number;
  data: SetupDraftData;
  savedAt: string;
};

export function getSeller(): SellerProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return SellerProfileSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function setSeller(seller: SellerProfile): void {
  const validated = SellerProfileSchema.parse(seller);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
}

export function clearSeller(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveDraft(step: number, data: SetupDraftData): void {
  if (typeof window === "undefined") return;

  const draft: SetupDraft = {
    step,
    data,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(SETUP_DRAFT_KEY, JSON.stringify(draft));
}

export function loadDraft(): SetupDraft | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(SETUP_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SetupDraft;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SETUP_DRAFT_KEY);
}

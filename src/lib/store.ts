import { SellerProfile, SellerProfileSchema } from "@/lib/schemas";

const STORAGE_KEY = "sahayak-seller";

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

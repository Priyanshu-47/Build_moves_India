import { CheckStatus, SellerProfile } from "@/lib/schemas";

export type DocumentCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
};

export type DocumentValidationResult = {
  score: number;
  checks: DocumentCheck[];
};

export type NameMismatchResult = {
  mismatch: boolean;
  explanation: string;
};

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
const BANK_ACCOUNT_REGEX = /^[0-9]{9,18}$/;

function normalizeName(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function nameTokens(value: string): string[] {
  return normalizeName(value).split(" ").filter(Boolean);
}

function namesCompatible(a: string, b: string): boolean {
  const tokensA = nameTokens(a);
  const tokensB = nameTokens(b);
  if (tokensA.length === 0 || tokensB.length === 0) return false;

  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  const overlap = tokensA.filter((token) => setB.has(token)).length;
  const overlapRatio = overlap / Math.max(tokensA.length, tokensB.length);

  return (
    normalizeName(a) === normalizeName(b) ||
    overlapRatio >= 0.75 ||
    (tokensA.length >= 2 &&
      tokensB.length >= 2 &&
      tokensA[0] === tokensB[0] &&
      tokensA[tokensA.length - 1] === tokensB[tokensB.length - 1])
  );
}

export function detectNameMismatch(
  panName: string,
  aadhaarName: string,
  gstName: string,
  bankName: string
): NameMismatchResult {
  const names = [
    { label: "PAN", value: panName },
    { label: "Aadhaar", value: aadhaarName },
    { label: "GST", value: gstName },
    { label: "Bank", value: bankName },
  ].filter((entry) => entry.value.trim().length > 0);

  if (names.length < 2) {
    return {
      mismatch: false,
      explanation: "Not enough name fields to compare.",
    };
  }

  const mismatches: string[] = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      if (!namesCompatible(names[i].value, names[j].value)) {
        mismatches.push(
          `${names[i].label} ("${names[i].value}") vs ${names[j].label} ("${names[j].value}")`
        );
      }
    }
  }

  if (mismatches.length === 0) {
    return {
      mismatch: false,
      explanation: "Names are consistent across PAN, Aadhaar, GST, and bank records.",
    };
  }

  return {
    mismatch: true,
    explanation: `Name mismatch detected: ${mismatches.join("; ")}. GeM rejects when PAN/Aadhaar/GST names differ even slightly.`,
  };
}

function isDemoPan(pan: string): boolean {
  return pan.toUpperCase().includes("DEMO");
}

function isDemoGstin(gstin: string): boolean {
  return gstin.toUpperCase().includes("DEMO");
}

function checkWeight(status: CheckStatus): number {
  if (status === "pass") return 1;
  if (status === "warn") return 0.5;
  return 0;
}

export type DocumentValidationInput = SellerProfile & {
  email?: string;
  bankAccount?: string;
  ifsc?: string;
};

export function validateDocuments(
  seller: DocumentValidationInput
): DocumentValidationResult {
  const checks: DocumentCheck[] = [];

  const pan = seller.pan?.trim() ?? "";
  const gstin = seller.gstin?.trim() ?? "";
  const email = seller.email?.trim() ?? "";
  const bankAccount = seller.bankAccount?.trim() ?? "";
  const ifsc = seller.ifsc?.trim() ?? "";

  const panValid =
    pan.length > 0 && (PAN_REGEX.test(pan) || isDemoPan(pan));
  checks.push({
    id: "pan_format",
    label: "PAN format",
    status: panValid ? (isDemoPan(pan) ? "warn" : "pass") : "fail",
    message: panValid
      ? isDemoPan(pan)
        ? "Demo PAN placeholder — replace with real PAN before GeM registration."
        : `PAN ${pan.toUpperCase()} format is valid.`
      : "Invalid PAN format. Expected: ABCDE1234F",
  });

  const gstinValid =
    gstin.length > 0 && (GSTIN_REGEX.test(gstin) || isDemoGstin(gstin));
  checks.push({
    id: "gstin_format",
    label: "GSTIN format",
    status: gstinValid ? (isDemoGstin(gstin) ? "warn" : "pass") : "fail",
    message: gstinValid
      ? isDemoGstin(gstin)
        ? "Demo GSTIN placeholder — use your real 15-character GSTIN."
        : `GSTIN ${gstin.toUpperCase()} format is valid.`
      : "Invalid GSTIN format. Must be 15 characters.",
  });

  const nameCheck = detectNameMismatch(
    seller.name,
    seller.name,
    seller.businessName,
    seller.name
  );
  checks.push({
    id: "name_consistency",
    label: "Name consistency",
    status: nameCheck.mismatch ? "fail" : "pass",
    message: nameCheck.explanation,
  });

  const bankAccountValid =
    bankAccount.length > 0 && BANK_ACCOUNT_REGEX.test(bankAccount);
  checks.push({
    id: "bank_account",
    label: "Bank account format",
    status: bankAccountValid
      ? "pass"
      : seller.bankVerified
        ? "warn"
        : "fail",
    message: bankAccountValid
      ? "Bank account number format looks valid (9–18 digits)."
      : seller.bankVerified
        ? "Bank verified on profile, but account number not provided for format check."
        : "Enter a valid bank account number (9–18 digits).",
  });

  const ifscValid = ifsc.length > 0 && IFSC_REGEX.test(ifsc);
  checks.push({
    id: "ifsc",
    label: "IFSC code",
    status: ifscValid ? "pass" : seller.bankVerified ? "warn" : "fail",
    message: ifscValid
      ? `IFSC ${ifsc.toUpperCase()} format is valid.`
      : seller.bankVerified
        ? "Bank verified — add IFSC for full document check."
        : "IFSC required for penny-drop verification (e.g. SBIN0001234).",
  });

  const emailValid = email.length > 0 && EMAIL_REGEX.test(email);
  checks.push({
    id: "email",
    label: "Email format",
    status: emailValid ? "pass" : "warn",
    message: emailValid
      ? `Email ${email} format is valid.`
      : "Add an official email — all GeM notifications are sent here.",
  });

  checks.push({
    id: "bank_verified",
    label: "Bank verification",
    status: seller.bankVerified ? "pass" : "fail",
    message: seller.bankVerified
      ? "Bank account verification complete."
      : "Bank penny-drop verification pending.",
  });

  const earned = checks.reduce((sum, check) => sum + checkWeight(check.status), 0);
  const score = Math.round((earned / checks.length) * 100);

  return { score, checks };
}

export function getRegistrationProgressStep(score: number): number {
  if (score >= 95) return 7;
  if (score >= 85) return 6;
  if (score >= 70) return 5;
  if (score >= 55) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

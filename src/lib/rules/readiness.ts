import {
  BidOpportunity,
  Blocker,
  CheckStatus,
  ReadinessCheck,
  ReadinessResult,
  SellerProfile,
} from "@/lib/schemas";

const CHECK_WEIGHTS = {
  product_match: 15,
  certifications: 15,
  caution_money: 15,
  bank_verified: 15,
  capacity: 15,
  deadline: 15,
  emd: 10,
} as const;

type CheckId = keyof typeof CHECK_WEIGHTS;

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

function hoursUntilDeadline(deadline: string): number {
  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999);
  return (end.getTime() - Date.now()) / (1000 * 60 * 60);
}

function isDeadlinePassed(deadline: string): boolean {
  return hoursUntilDeadline(deadline) < 0;
}

function scoreProductOverlap(seller: SellerProfile, bid: BidOpportunity): number {
  const bidText = normalizeText([bid.title, ...bid.categoryPath].join(" "));
  let bestScore = 0;

  for (const product of seller.products) {
    const productNorm = normalizeText(product);
    if (bidText.includes(productNorm)) {
      bestScore = Math.max(bestScore, 100);
      continue;
    }

    const words = productNorm.split(/\s+/).filter((word) => word.length > 2);
    const matchedWords = words.filter((word) => bidText.includes(word));
    if (matchedWords.length > 0) {
      bestScore = Math.max(bestScore, (matchedWords.length / words.length) * 85);
    }
  }

  return Math.round(bestScore);
}

function monthlyCapacityRatio(seller: SellerProfile, bid: BidOpportunity): number {
  const monthsToDeliver = Math.max(bid.deliveryDays / 30, 1);
  const monthlyNeed = bid.quantity / monthsToDeliver;
  if (monthlyNeed <= 0) return 1;
  return seller.monthlyCapacity / monthlyNeed;
}

function statusFromScore(score: number, passAt = 70, warnAt = 40): CheckStatus {
  if (score >= passAt) return "pass";
  if (score >= warnAt) return "warn";
  return "fail";
}

function weightedContribution(weight: number, status: CheckStatus): number {
  if (status === "pass") return weight;
  if (status === "warn") return weight * 0.5;
  return 0;
}

function checkProductMatch(
  seller: SellerProfile,
  bid: BidOpportunity
): ReadinessCheck {
  const overlap = scoreProductOverlap(seller, bid);
  const status = statusFromScore(overlap, 60, 30);

  return {
    id: "product_match",
    label: "Product match",
    status,
    weight: CHECK_WEIGHTS.product_match,
    message:
      status === "pass"
        ? "Your listed products align with this tender."
        : status === "warn"
          ? "Partial product overlap — confirm catalogue listing."
          : "Your products do not match this tender category.",
  };
}

function checkCertifications(
  seller: SellerProfile,
  bid: BidOpportunity
): ReadinessCheck {
  if (bid.requiredCertifications.length === 0) {
    return {
      id: "certifications",
      label: "Certifications",
      status: "pass",
      weight: CHECK_WEIGHTS.certifications,
      message: "No special certifications required.",
    };
  }

  const missing = bid.requiredCertifications.filter(
    (required) => !hasCertification(seller.certifications, required)
  );

  if (missing.length === 0) {
    return {
      id: "certifications",
      label: "Certifications",
      status: "pass",
      weight: CHECK_WEIGHTS.certifications,
      message: "All required certifications are on file.",
    };
  }

  const status: CheckStatus =
    missing.length === bid.requiredCertifications.length ? "fail" : "warn";

  return {
    id: "certifications",
    label: "Certifications",
    status,
    weight: CHECK_WEIGHTS.certifications,
    message: `Missing: ${missing.join(", ")}.`,
  };
}

function checkCautionMoney(seller: SellerProfile): ReadinessCheck {
  return {
    id: "caution_money",
    label: "Caution money",
    status: seller.cautionMoneyPaid ? "pass" : "fail",
    weight: CHECK_WEIGHTS.caution_money,
    message: seller.cautionMoneyPaid
      ? "Caution money deposit confirmed."
      : "Caution money has not been deposited on GeM.",
  };
}

function checkBankVerified(seller: SellerProfile): ReadinessCheck {
  return {
    id: "bank_verified",
    label: "Bank verification",
    status: seller.bankVerified ? "pass" : "fail",
    weight: CHECK_WEIGHTS.bank_verified,
    message: seller.bankVerified
      ? "Bank account is verified."
      : "Bank account verification is pending.",
  };
}

function checkCapacity(seller: SellerProfile, bid: BidOpportunity): ReadinessCheck {
  const ratio = monthlyCapacityRatio(seller, bid);
  const percent = Math.round(ratio * 100);

  let status: CheckStatus = "pass";
  if (ratio < 0.5) status = "fail";
  else if (ratio < 1) status = "warn";

  return {
    id: "capacity",
    label: "Production capacity",
    status,
    weight: CHECK_WEIGHTS.capacity,
    message:
      status === "pass"
        ? `Monthly capacity (${seller.monthlyCapacity} units) covers delivery needs.`
        : `Capacity is ${percent}% of required monthly output (${bid.quantity} units in ${bid.deliveryDays} days).`,
  };
}

function checkDeadline(bid: BidOpportunity): ReadinessCheck {
  if (isDeadlinePassed(bid.deadline)) {
    return {
      id: "deadline",
      label: "Deadline feasibility",
      status: "fail",
      weight: CHECK_WEIGHTS.deadline,
      message: "Bid deadline has already passed.",
    };
  }

  const hoursLeft = hoursUntilDeadline(bid.deadline);
  if (hoursLeft < 48) {
    return {
      id: "deadline",
      label: "Deadline feasibility",
      status: "warn",
      weight: CHECK_WEIGHTS.deadline,
      message: "Less than 48 hours remain to submit this bid.",
    };
  }

  return {
    id: "deadline",
    label: "Deadline feasibility",
    status: "pass",
    weight: CHECK_WEIGHTS.deadline,
    message: "Enough time remains to prepare and submit.",
  };
}

function checkEmd(bid: BidOpportunity): ReadinessCheck {
  if (!bid.emdAmount || bid.emdAmount <= 0) {
    return {
      id: "emd",
      label: "Earnest money (EMD)",
      status: "pass",
      weight: CHECK_WEIGHTS.emd,
      message: "No earnest money deposit required.",
    };
  }

  return {
    id: "emd",
    label: "Earnest money (EMD)",
    status: "warn",
    weight: CHECK_WEIGHTS.emd,
    message: `EMD of ₹${bid.emdAmount.toLocaleString("en-IN")} must be deposited before submission.`,
  };
}

function buildBlockers(checks: ReadinessCheck[]): Blocker[] {
  const blockers: Blocker[] = [];

  for (const check of checks) {
    if (check.status !== "fail") continue;

    switch (check.id as CheckId) {
      case "product_match":
        blockers.push({
          code: "CATEGORY_WRONG",
          message: check.message ?? "Product category mismatch.",
          severity: "critical",
        });
        break;
      case "certifications":
        blockers.push({
          code: "BIS_MISSING",
          message: check.message ?? "Required certifications missing.",
          severity: "critical",
        });
        break;
      case "caution_money":
        blockers.push({
          code: "CAUTION_MONEY",
          message: check.message ?? "Caution money not deposited.",
          severity: "critical",
        });
        break;
      case "bank_verified":
        blockers.push({
          code: "NAME_MISMATCH",
          message: check.message ?? "Bank verification incomplete.",
          severity: "critical",
        });
        break;
      case "capacity":
        blockers.push({
          code: "CAPACITY_LOW",
          message: check.message ?? "Insufficient production capacity.",
          severity: "critical",
        });
        break;
      case "deadline":
        blockers.push({
          code: "DEADLINE_SOON",
          message: check.message ?? "Deadline not feasible.",
          severity: "critical",
        });
        break;
      case "emd":
        blockers.push({
          code: "EMD_REQUIRED",
          message: check.message ?? "Earnest money deposit required.",
          severity: "warning",
        });
        break;
    }
  }

  const emdCheck = checks.find((check) => check.id === "emd");
  if (emdCheck?.status === "warn") {
    blockers.push({
      code: "EMD_REQUIRED",
      message: emdCheck.message ?? "Earnest money deposit required.",
      severity: "warning",
    });
  }

  return blockers;
}

export function computeReadiness(
  seller: SellerProfile,
  bid: BidOpportunity
): ReadinessResult {
  const checks: ReadinessCheck[] = [
    checkProductMatch(seller, bid),
    checkCertifications(seller, bid),
    checkCautionMoney(seller),
    checkBankVerified(seller),
    checkCapacity(seller, bid),
    checkDeadline(bid),
    checkEmd(bid),
  ];

  const earned = checks.reduce(
    (total, check) => total + weightedContribution(check.weight, check.status),
    0
  );

  const readinessScore = Math.round(earned);

  return {
    bidId: bid.id,
    readinessScore,
    checks,
    blockers: buildBlockers(checks),
  };
}

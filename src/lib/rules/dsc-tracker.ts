/** Reference "today" for consistent mock day calculations in the prototype. */
export const REFERENCE_TODAY = "2026-08-26";

export type DSC = {
  holderName: string;
  provider: string;
  expiryDate: string;
  issuedDate?: string;
};

export type DSCStatus = {
  valid: boolean;
  daysUntilExpiry: number;
  renewalNeeded: boolean;
  status: "valid" | "expiring" | "expired";
};

export type DSCCostInfo = {
  cost: string;
  validity: string;
  providers: string[];
};

const EXPIRING_THRESHOLD_DAYS = 30;

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function daysUntil(from: string, to: string = REFERENCE_TODAY): number {
  const end = parseDate(to);
  const start = parseDate(from);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export function checkDSCStatus(dsc: DSC): DSCStatus {
  const daysUntilExpiry = daysUntil(REFERENCE_TODAY, dsc.expiryDate);

  if (daysUntilExpiry < 0) {
    return {
      valid: false,
      daysUntilExpiry,
      renewalNeeded: true,
      status: "expired",
    };
  }

  if (daysUntilExpiry <= EXPIRING_THRESHOLD_DAYS) {
    return {
      valid: true,
      daysUntilExpiry,
      renewalNeeded: true,
      status: "expiring",
    };
  }

  return {
    valid: true,
    daysUntilExpiry,
    renewalNeeded: false,
    status: "valid",
  };
}

export function getDSCRenewalSteps(): string[] {
  return [
    "Choose a licensed Certifying Authority (CA) — eMudhra, NSDL, or CDAC.",
    "Apply online with PAN, Aadhaar, and business proof. Select Class 3 DSC for GeM.",
    "Complete video/physical verification as required by the CA.",
    "Receive DSC on USB token within 3–7 business days. Install drivers and test on GeM.",
  ];
}

export function getDSCCost(): DSCCostInfo {
  return {
    cost: "₹1,500-5,000",
    validity: "1-3 years",
    providers: ["eMudhra", "NSDL", "CDAC"],
  };
}

/** Mock DSC for demo seller — expiring in 15 days from reference date. */
export const MOCK_DSC: DSC = {
  holderName: "Ramesh Kumar",
  provider: "eMudhra",
  issuedDate: "2024-09-10",
  expiryDate: "2026-09-10",
};

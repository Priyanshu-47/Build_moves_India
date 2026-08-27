import { BidOpportunity, BidOpportunitySchema, SellerProfile } from "@/lib/schemas";
import corrigendaData from "@/data/corrigenda.json";
import { computeReadiness } from "@/lib/rules/readiness";

export type ChangeImpact =
  | "deadline"
  | "value"
  | "eligibility"
  | "capacity"
  | "specification"
  | "location"
  | "other";

export type CorrigendumSeverity = "minor" | "moderate" | "major" | "critical";

export type BidFieldChange = {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  impact: ChangeImpact;
};

export type ReadinessImpact = {
  before: number;
  after: number;
  delta: number;
  affectedChecks: string[];
};

export type DetectChangesResult = {
  changes: BidFieldChange[];
  readinessImpact: ReadinessImpact;
  severity: CorrigendumSeverity;
  newBlockers: string[];
  removedBlockers: string[];
};

export type CorrigendumImpact = {
  summary: string;
  whatChanged: string[];
  whatItMeans: string;
  actionRequired: string;
};

export type CorrigendumRecord = {
  id: string;
  bidId: string;
  corrigendumNumber: number;
  publishedDate: string;
  title: string;
  originalBid: BidOpportunity;
  amendedBid: BidOpportunity;
};

export function loadCorrigenda(): CorrigendumRecord[] {
  return (corrigendaData as Array<Omit<CorrigendumRecord, "originalBid" | "amendedBid"> & {
    originalBid: unknown;
    amendedBid: unknown;
  }>).map((item) => ({
    ...item,
    originalBid: BidOpportunitySchema.parse(item.originalBid),
    amendedBid: BidOpportunitySchema.parse(item.amendedBid),
  }));
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  if (typeof value === "number") return value.toLocaleString("en-IN");
  return String(value);
}

function classifyImpact(field: string): ChangeImpact {
  if (field.includes("deadline") || field === "deliveryDays" || field === "status") {
    return "deadline";
  }
  if (field.includes("estimatedValue") || field.includes("emdAmount")) return "value";
  if (field.includes("requiredCertifications") || field === "mseReserved") {
    return "eligibility";
  }
  if (field === "quantity" || field === "unit") return "capacity";
  if (field.includes("goldenParameters") || field.includes("evaluationCriteria")) {
    return "specification";
  }
  if (field.includes("location")) return "location";
  return "other";
}

function pushChange(
  changes: BidFieldChange[],
  field: string,
  oldValue: unknown,
  newValue: unknown
): void {
  const oldStr = formatValue(oldValue);
  const newStr = formatValue(newValue);
  if (oldStr === newStr) return;

  changes.push({
    field,
    oldValue,
    newValue,
    impact: classifyImpact(field),
  });
}

function compareRecords(
  changes: BidFieldChange[],
  prefix: string,
  oldRecord: Record<string, string>,
  newRecord: Record<string, string>
): void {
  const keys = new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]);
  for (const key of keys) {
    pushChange(changes, `${prefix}.${key}`, oldRecord[key] ?? "—", newRecord[key] ?? "—");
  }
}

function compareScalarFields(
  changes: BidFieldChange[],
  originalBid: BidOpportunity,
  newBid: BidOpportunity
): void {
  const scalarFields: (keyof BidOpportunity)[] = [
    "title",
    "department",
    "quantity",
    "unit",
    "estimatedValue",
    "deadline",
    "emdAmount",
    "mseReserved",
    "deliveryDays",
    "status",
  ];

  for (const field of scalarFields) {
    pushChange(changes, field, originalBid[field], newBid[field]);
  }

  pushChange(
    changes,
    "location.state",
    originalBid.location.state,
    newBid.location.state
  );
  pushChange(changes, "location.city", originalBid.location.city, newBid.location.city);
}

function deriveSeverity(delta: number, newBlockers: string[]): CorrigendumSeverity {
  const criticalBlockers = newBlockers.length;
  if (delta <= -25 || criticalBlockers >= 3) return "critical";
  if (delta <= -15 || criticalBlockers >= 2) return "major";
  if (delta <= -8 || criticalBlockers >= 1) return "moderate";
  return "minor";
}

function describeChange(change: BidFieldChange): string {
  const label = change.field.replace(/\./g, " · ");
  return `${label}: ${formatValue(change.oldValue)} → ${formatValue(change.newValue)}`;
}

function buildImpactSummary(changes: BidFieldChange[]): string {
  const highlights: string[] = [];

  for (const change of changes) {
    if (change.impact === "deadline" && change.field === "deliveryDays") {
      highlights.push(
        `Delivery shortened to ${formatValue(change.newValue)} days (was ${formatValue(change.oldValue)})`
      );
    }
    if (change.impact === "eligibility" && change.field === "requiredCertifications") {
      highlights.push("New certifications required");
    }
    if (change.impact === "capacity" && change.field === "quantity") {
      highlights.push(
        `Quantity increased to ${formatValue(change.newValue)} (was ${formatValue(change.oldValue)})`
      );
    }
    if (change.impact === "specification" && change.field.startsWith("goldenParameters")) {
      highlights.push("Technical specifications revised");
    }
  }

  if (highlights.length === 0) {
    return `${changes.length} field(s) updated in this corrigendum.`;
  }

  return [...new Set(highlights)].slice(0, 3).join(". ") + ".";
}

export function detectChanges(
  originalBid: BidOpportunity,
  newBid: BidOpportunity,
  seller: SellerProfile
): DetectChangesResult {
  const changes: BidFieldChange[] = [];

  compareScalarFields(changes, originalBid, newBid);
  pushChange(
    changes,
    "requiredCertifications",
    originalBid.requiredCertifications,
    newBid.requiredCertifications
  );
  pushChange(
    changes,
    "evaluationCriteria",
    originalBid.evaluationCriteria,
    newBid.evaluationCriteria
  );
  compareRecords(changes, "goldenParameters", originalBid.goldenParameters, newBid.goldenParameters);

  const readinessBefore = computeReadiness(seller, originalBid);
  const readinessAfter = computeReadiness(seller, newBid);

  const beforeBlockers = new Set(readinessBefore.blockers.map((b) => b.code));
  const afterBlockers = new Set(readinessAfter.blockers.map((b) => b.code));

  const newBlockers = readinessAfter.blockers
    .filter((blocker) => !beforeBlockers.has(blocker.code))
    .map((blocker) => blocker.message);

  const removedBlockers = readinessBefore.blockers
    .filter((blocker) => !afterBlockers.has(blocker.code))
    .map((blocker) => blocker.message);

  const before = readinessBefore.readinessScore;
  const after = readinessAfter.readinessScore;
  const delta = after - before;

  const affectedChecks = readinessAfter.checks
    .filter((check) => {
      const beforeCheck = readinessBefore.checks.find((item) => item.id === check.id);
      return beforeCheck && beforeCheck.status !== check.status;
    })
    .map((check) => check.label);

  return {
    changes,
    readinessImpact: { before, after, delta, affectedChecks },
    severity: deriveSeverity(delta, newBlockers),
    newBlockers,
    removedBlockers,
  };
}

export function getCorrigendumImpact(
  changes: BidFieldChange[],
  detection: Pick<DetectChangesResult, "readinessImpact" | "newBlockers" | "severity">
): CorrigendumImpact {
  const whatChanged = changes.map(describeChange);
  const summary = buildImpactSummary(changes);

  const { before, after, delta } = detection.readinessImpact;
  const direction = delta < 0 ? "dropped" : delta > 0 ? "improved" : "unchanged";

  let whatItMeans =
    `Your readiness score ${direction} from ${before}% to ${after}% after this corrigendum. `;

  if (detection.newBlockers.length > 0) {
    whatItMeans += `New blockers: ${detection.newBlockers.join("; ")}. `;
  } else if (delta < 0) {
    whatItMeans += "Existing checks are now harder to pass — review capacity and compliance. ";
  } else {
    whatItMeans += "No new hard blockers, but verify all updated specifications. ";
  }

  let actionRequired: string;
  switch (detection.severity) {
    case "critical":
      actionRequired =
        "Do not bid until blockers are resolved or you accept high rejection risk. Re-run readiness and cost simulation.";
      break;
    case "major":
      actionRequired =
        "Fix new blockers or walk away. Update pricing — quantity, value, and delivery may have changed.";
      break;
    case "moderate":
      actionRequired =
        "Review changed fields, update your bid documents, and confirm you still meet all criteria.";
      break;
    default:
      actionRequired =
        "Minor changes — update your submission pack and confirm golden parameters still match.";
  }

  return {
    summary,
    whatChanged,
    whatItMeans,
    actionRequired,
  };
}

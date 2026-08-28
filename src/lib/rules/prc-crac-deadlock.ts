import deadlockData from "@/data/prc-crac-deadlock.json";
import {
  MSMED_PAYMENT_PERIOD_DAYS,
  PENALTY_RATE_ANNUAL,
  getToday,
  calculateInterest,
  daysBetween,
} from "@/lib/rules/msme-rights";

export type PrcStatus = "not_generated" | "generated" | "rejected";
export type CracStatus =
  | "not_generated"
  | "blocked_by_prc"
  | "generated"
  | "pending_invoice";

export type DeadlockType =
  | "prc_pending"
  | "crac_pending"
  | "invoice_pending"
  | "payment_pending"
  | "none";

export type StuckParty = "consignee" | "buyer_finance" | "pfms" | "unknown";

export type DeadlockOrder = {
  id: string;
  orderId: string;
  bidTitle: string;
  department: string;
  consigneeName: string;
  orderValue: number;
  deliveryDate: string;
  deliveryConfirmed: boolean;
  prcDate: string | null;
  prcStatus: PrcStatus;
  cracDate: string | null;
  cracStatus: CracStatus;
  invoiceDate: string | null;
  paymentDate: string | null;
  escalationLevel: number;
  stuckReason: string;
  sellerCanDo: string[];
};

export type EscalationStep = {
  level: number;
  action: string;
  portal: string;
  portalUrl: string;
  template: string;
  daysToWait: number;
  expectedResponse: string;
};

export type DetectDeadlockResult = {
  isDeadlocked: boolean;
  deadlockType: DeadlockType;
  daysStuck: number;
  daysSinceDelivery: number;
  whoIsStuck: StuckParty;
  canSellerAct: boolean;
  sellerActions: string[];
  escalationPath: EscalationStep[];
  msmmedEligible: boolean;
  interestAccrued: number;
  stuckAtLabel: string;
};

export type DeadlockEscalation = {
  currentLevel: number;
  nextAction: string;
  levels: EscalationStep[];
};

export type DeadlockInterest = {
  principal: number;
  daysOverdue: number;
  interestRate: number;
  interestAccrued: number;
  totalOwed: number;
  note: string;
};

const ESCALATION_LEVELS: Omit<EscalationStep, "template">[] = [
  {
    level: 1,
    action: "Email consignee",
    portal: "Email",
    portalUrl: "mailto:",
    daysToWait: 7,
    expectedResponse: "PRC/CRAC generation within 7 working days",
  },
  {
    level: 2,
    action: "Visit consignee office with delivery proof",
    portal: "In person",
    portalUrl: "",
    daysToWait: 5,
    expectedResponse: "Written acknowledgement and timeline",
  },
  {
    level: 3,
    action: "Raise GeM incident",
    portal: "GeM Helpdesk",
    portalUrl: "https://gem.gov.in",
    daysToWait: 15,
    expectedResponse: "GeM ticket resolution in 10–15 working days",
  },
  {
    level: 4,
    action: "File CPGRAMS grievance",
    portal: "CPGRAMS",
    portalUrl: "https://pgportal.gov.in",
    daysToWait: 30,
    expectedResponse: "Department response within 30 days",
  },
  {
    level: 5,
    action: "File MSME Samadhaan (ODR)",
    portal: "MSME Samadhaan",
    portalUrl: "https://samadhaan.msme.gov.in",
    daysToWait: 90,
    expectedResponse: "Facilitation council mediation within 90 days",
  },
];

function buildEmailTemplate(order: DeadlockOrder): string {
  return `Subject: Urgent — PRC/CRAC generation pending for GeM Order ${order.orderId}

Dear ${order.consigneeName},

We delivered goods for "${order.bidTitle}" on ${order.deliveryDate} (Order ID: ${order.orderId}, Value: ₹${order.orderValue.toLocaleString("en-IN")}).

As of today, PRC has not been generated on GeM. Without PRC, CRAC cannot be issued and our payment remains blocked despite confirmed delivery.

We request you to:
1. Generate PRC on GeM within 48 hours
2. Confirm expected CRAC date in writing
3. Share the name and contact of the officer handling this order

Attached: Delivery challan, stamped POD, and invoice copy.

We are an MSME supplier — delayed acceptance affects our statutory payment rights under the MSMED Act, 2006.

Regards,
[Your Business Name]
[Udyam Registration Number]
[Contact]`;
}

function buildVisitTemplate(order: DeadlockOrder): string {
  return `VISIT CHECKLIST — ${order.orderId}

Department: ${order.department}
Consignee: ${order.consigneeName}
Delivery date: ${order.deliveryDate}

Carry:
□ Original delivery challan (stamped)
□ Copy of GeM order
□ Photo of goods at delivery site (if available)
□ Register entry pass / ID

Ask consignee to:
□ Acknowledge receipt in writing
□ Generate PRC on GeM while you are present
□ Provide officer name and phone for follow-up

Document everything — date, time, officer name, and what was promised.`;
}

function buildGemIncidentTemplate(order: DeadlockOrder): string {
  return `GeM INCIDENT — Non-generation of PRC/CRAC

Order ID: ${order.orderId}
Bid: ${order.bidTitle}
Department: ${order.department}
Order value: ₹${order.orderValue.toLocaleString("en-IN")}
Delivery date: ${order.deliveryDate}
Days since delivery: ${daysBetween(order.deliveryDate)}

Issue: Goods delivered and accepted physically, but PRC/CRAC not generated on GeM. Payment chain frozen.

Seller action taken: Email follow-ups on [dates]. No resolution.

Requested action: Direct consignee to generate PRC and CRAC, or assign GeM nodal officer to unblock.`;
}

function buildCpgramsTemplate(order: DeadlockOrder): string {
  return `CPGRAMS GRIEVANCE DRAFT

Ministry/Department: ${order.department}
Subject: Non-generation of PRC/CRAC on GeM — payment blocked

Description:
We are an MSME supplier registered on GeM. Order ${order.orderId} for "${order.bidTitle}" was delivered on ${order.deliveryDate}. Despite repeated follow-ups, the consignee has not generated PRC/CRAC on GeM, blocking payment of ₹${order.orderValue.toLocaleString("en-IN")}.

This violates timely acceptance norms and causes financial hardship to a micro/small enterprise.

Prayer: Direct consignee to generate PRC and CRAC immediately and release payment with applicable interest under MSMED Act.`;
}

function buildSamadhaanTemplate(order: DeadlockOrder): string {
  const interest = calculateDeadlockInterest(order);
  return `MSME SAMADHAAN COMPLAINT

Buyer: ${order.department}
Order/Invoice: ${order.orderId}
Amount due: ₹${order.orderValue.toLocaleString("en-IN")}
Interest claimed (Sec 16): ₹${interest.interestAccrued.toLocaleString("en-IN")}

Facts:
- Delivery: ${order.deliveryDate}
- CRAC: ${order.cracDate ?? "Not generated — blocked at PRC stage"}
- Invoice: ${order.invoiceDate ?? "Pending"}
- Days stuck: ${daysBetween(order.deliveryDate)} since delivery

Relief sought: Principal + compound interest at 3× RBI rate (${(PENALTY_RATE_ANNUAL * 100).toFixed(2)}% p.a.)`;
}

function templateForLevel(level: number, order: DeadlockOrder): string {
  switch (level) {
    case 1:
      return buildEmailTemplate(order);
    case 2:
      return buildVisitTemplate(order);
    case 3:
      return buildGemIncidentTemplate(order);
    case 4:
      return buildCpgramsTemplate(order);
    case 5:
      return buildSamadhaanTemplate(order);
    default:
      return buildEmailTemplate(order);
  }
}

export function loadDeadlockOrders(): DeadlockOrder[] {
  return deadlockData as DeadlockOrder[];
}

function resolveDeadlockType(order: DeadlockOrder): DeadlockType {
  if (order.paymentDate) return "none";
  if (order.prcStatus === "not_generated" || order.prcStatus === "rejected") {
    return "prc_pending";
  }
  if (order.cracStatus === "blocked_by_prc" || order.cracStatus === "not_generated") {
    return "crac_pending";
  }
  if (!order.invoiceDate) return "invoice_pending";
  if (!order.paymentDate) return "payment_pending";
  return "none";
}

function resolveStuckParty(order: DeadlockOrder, type: DeadlockType): StuckParty {
  if (type === "prc_pending" || type === "crac_pending") return "consignee";
  if (type === "invoice_pending") return "consignee";
  if (type === "payment_pending" && order.cracDate) return "pfms";
  return "unknown";
}

function stuckAtLabel(type: DeadlockType): string {
  switch (type) {
    case "prc_pending":
      return "PRC not generated by consignee";
    case "crac_pending":
      return "CRAC blocked — waiting on consignee";
    case "invoice_pending":
      return "Invoice not processed";
    case "payment_pending":
      return "Payment not released by buyer finance / PFMS";
    default:
      return "No deadlock detected";
  }
}

function daysStuck(order: DeadlockOrder, type: DeadlockType): number {
  const sinceDelivery = daysBetween(order.deliveryDate);
  if (type === "payment_pending" && order.cracDate) {
    const sinceCrac = daysBetween(order.cracDate);
    return Math.max(0, sinceCrac - MSMED_PAYMENT_PERIOD_DAYS);
  }
  if (type === "prc_pending" || type === "crac_pending") {
    return Math.max(0, sinceDelivery - 10);
  }
  return sinceDelivery;
}

export function calculateDeadlockInterest(order: DeadlockOrder): DeadlockInterest {
  const principal = order.orderValue;
  const sinceDelivery = daysBetween(order.deliveryDate);

  let daysOverdue: number;
  let note: string;

  if (order.cracDate) {
    const sinceAcceptance = daysBetween(order.cracDate);
    daysOverdue = Math.max(0, sinceAcceptance - MSMED_PAYMENT_PERIOD_DAYS);
    note =
      daysOverdue > 0
        ? `Interest accrues from ${MSMED_PAYMENT_PERIOD_DAYS} days after CRAC acceptance (${order.cracDate}).`
        : "Payment window still open — interest starts after 45 days from CRAC.";
  } else {
    daysOverdue = Math.max(0, sinceDelivery - MSMED_PAYMENT_PERIOD_DAYS);
    note =
      "CRAC not yet generated — interest shown for de facto delay since delivery + 45 days. Formal clock starts at CRAC.";
  }

  const interestAccrued = calculateInterest(principal, daysOverdue);

  return {
    principal,
    daysOverdue: daysOverdue > 0 ? daysOverdue : sinceDelivery,
    interestRate: PENALTY_RATE_ANNUAL,
    interestAccrued,
    totalOwed: principal + interestAccrued,
    note,
  };
}

export function getDeadlockEscalation(order: DeadlockOrder): DeadlockEscalation {
  const levels: EscalationStep[] = ESCALATION_LEVELS.map((step) => ({
    ...step,
    template: templateForLevel(step.level, order),
  }));

  const currentLevel = Math.min(Math.max(order.escalationLevel, 1), levels.length);
  const nextAction = levels[currentLevel - 1]?.action ?? levels[0].action;

  return {
    currentLevel,
    nextAction,
    levels,
  };
}

export function detectDeadlock(order: DeadlockOrder): DetectDeadlockResult {
  const deadlockType = resolveDeadlockType(order);
  const isDeadlocked =
    order.deliveryConfirmed &&
    !order.paymentDate &&
    deadlockType !== "none";

  const whoIsStuck = resolveStuckParty(order, deadlockType);
  const interest = calculateDeadlockInterest(order);
  const escalation = getDeadlockEscalation(order);

  return {
    isDeadlocked,
    deadlockType,
    daysStuck: daysStuck(order, deadlockType),
    daysSinceDelivery: daysBetween(order.deliveryDate),
    whoIsStuck,
    canSellerAct: isDeadlocked,
    sellerActions: order.sellerCanDo,
    escalationPath: escalation.levels,
    msmmedEligible: isDeadlocked && daysBetween(order.deliveryDate) >= MSMED_PAYMENT_PERIOD_DAYS,
    interestAccrued: interest.interestAccrued,
    stuckAtLabel: stuckAtLabel(deadlockType),
  };
}

export function getTimelineSteps(order: DeadlockOrder): {
  key: string;
  label: string;
  status: "done" | "blocked" | "paused" | "pending";
}[] {
  const prcDone = order.prcStatus === "generated";
  const cracDone = order.cracStatus === "generated";
  const paymentDone = order.paymentDate !== null;

  let prcStatus: "done" | "blocked" | "paused" | "pending" = "pending";
  if (prcDone) prcStatus = "done";
  else if (order.deliveryConfirmed) prcStatus = "blocked";

  let cracStatus: "done" | "blocked" | "paused" | "pending" = "paused";
  if (cracDone) cracStatus = "done";
  else if (prcDone) cracStatus = "blocked";

  let paymentStatus: "done" | "blocked" | "paused" | "pending" = "paused";
  if (paymentDone) paymentStatus = "done";
  else if (cracDone && order.invoiceDate) paymentStatus = "blocked";

  return [
    { key: "delivery", label: "Delivery", status: order.deliveryConfirmed ? "done" : "pending" },
    { key: "prc", label: "PRC", status: prcStatus },
    { key: "crac", label: "CRAC", status: cracStatus },
    { key: "payment", label: "Payment", status: paymentStatus },
  ];
}

export { getToday };

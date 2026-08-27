import { getAccountOrders, getAccountPayments, getAccountRating } from "@/lib/demo-data";
import { loadBidHistory } from "@/lib/rules/learning";
import { PaymentOrder, SellerProfile } from "@/lib/schemas";
import { validateDocuments } from "@/lib/rules/registration";

export type JourneyStepStatus = "completed" | "current" | "upcoming";

export type JourneyStep = {
  id: string;
  label: string;
  status: JourneyStepStatus;
  date?: string;
  description?: string;
};

export type JourneyNextAction = {
  label: string;
  href: string;
  description: string;
};

export type JourneyProgress = {
  steps: JourneyStep[];
  completedCount: number;
  totalSteps: number;
  progressPercent: number;
  currentStep: JourneyStep | null;
  nextAction: JourneyNextAction | null;
};

const TOTAL_STEPS = 7;

const orders = getAccountOrders();
const payments = getAccountPayments();

function getRating() {
  return getAccountRating();
}

type StepDefinition = {
  id: string;
  label: string;
  done: boolean;
  date?: string;
  description?: string;
  nextAction: JourneyNextAction;
};

function isProfileComplete(seller: SellerProfile): boolean {
  return Boolean(
    seller.gstin &&
      seller.pan &&
      seller.bankVerified &&
      seller.products.length > 0 &&
      seller.certifications.length > 0
  );
}

function isDocumentsVerified(seller: SellerProfile): boolean {
  const validation = validateDocuments({
    ...seller,
    email: "seller@demo.local",
    bankAccount: seller.bankVerified ? "123456789012" : "",
    ifsc: seller.bankVerified ? "SBIN0001234" : "",
  });
  return validation.checks.every((check) => check.status !== "fail");
}

function isCatalogueListed(seller: SellerProfile): boolean {
  return seller.products.length > 0;
}

function isFirstBidSubmitted(): boolean {
  return loadBidHistory().length > 0;
}

function isOrderWon(): boolean {
  const history = loadBidHistory();
  return history.some((entry) => entry.result === "won") || orders.length > 0;
}

function isOrderDelivered(): boolean {
  return orders.some((order) => order.status === "delivered");
}

function isPaymentReceived(): boolean {
  return payments.some((order) => order.status === "paid");
}

function buildStepDefinitions(seller: SellerProfile): StepDefinition[] {
  const history = loadBidHistory().sort((a, b) => a.bidDate.localeCompare(b.bidDate));
  const firstBid = history[0];
  const firstWin = history.find((entry) => entry.result === "won");
  const firstOrder = [...orders].sort((a, b) => a.orderDate.localeCompare(b.orderDate))[0];
  const firstDelivery = orders
    .filter((order) => order.status === "delivered")
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate))[0];
  const firstPayment = payments
    .filter((order) => order.status === "paid")
    .sort((a, b) => (a.paymentDate ?? "").localeCompare(b.paymentDate ?? ""))[0];

  return [
    {
      id: "profile",
      label: "Profile Complete",
      done: isProfileComplete(seller),
      description: "GSTIN, PAN, bank, products, and certifications on file.",
      nextAction: {
        label: "Complete setup",
        href: "/setup",
        description: "Add missing GSTIN, PAN, bank details, and certifications.",
      },
    },
    {
      id: "documents",
      label: "Documents Verified",
      done: isDocumentsVerified(seller),
      description: "PAN, GSTIN, bank, and name checks passed.",
      nextAction: {
        label: "Verify documents",
        href: "/bid-prep",
        description: "Fix failing document checks before your first bid.",
      },
    },
    {
      id: "catalogue",
      label: "Catalogue Listed",
      done: isCatalogueListed(seller),
      date: isCatalogueListed(seller) ? getRating().catalogLastUpdate : undefined,
      description: `${seller.products.length || 0} product${seller.products.length === 1 ? "" : "s"} in your catalogue.`,
      nextAction: {
        label: "List a product",
        href: "/catalogue",
        description: "Add at least one GeM-compliant product listing.",
      },
    },
    {
      id: "first-bid",
      label: "First Bid",
      done: isFirstBidSubmitted(),
      date: firstBid?.bidDate,
      description: firstBid ? `Submitted: ${firstBid.title}` : "Submit your first tender bid on GeM.",
      nextAction: {
        label: "Find tenders",
        href: "/opportunities",
        description: "Browse matching tenders and submit your first bid.",
      },
    },
    {
      id: "order-won",
      label: "Order Won",
      done: isOrderWon(),
      date: firstWin?.bidDate ?? firstOrder?.orderDate,
      description: firstWin
        ? `Won: ${firstWin.title}`
        : firstOrder
          ? `Order confirmed: ${firstOrder.id}`
          : "Win your first GeM order.",
      nextAction: {
        label: "Improve win rate",
        href: "/learn",
        description: "Review bid history and sharpen your pricing strategy.",
      },
    },
    {
      id: "delivered",
      label: "Delivered",
      done: isOrderDelivered(),
      date: firstDelivery?.deliveryDate,
      description: firstDelivery
        ? "At least one order delivered to consignee."
        : "Deliver goods and get CRAC generated.",
      nextAction: {
        label: "Track delivery",
        href: "/orders",
        description: "Monitor in-transit orders and confirm delivery.",
      },
    },
    {
      id: "payment",
      label: "Payment Received",
      done: isPaymentReceived(),
      date: firstPayment?.paymentDate ?? undefined,
      description: firstPayment
        ? `Received ${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(firstPayment.totalValue)}`
        : "Get paid within MSMED 45-day window.",
      nextAction: {
        label: "Track payments",
        href: "/payments",
        description: "Follow up on CRAC, invoice, and overdue payments.",
      },
    },
  ];
}

function assignStatuses(definitions: StepDefinition[]): JourneyStep[] {
  const firstIncomplete = definitions.findIndex((step) => !step.done);

  return definitions.map((step, index) => {
    let status: JourneyStepStatus;
    if (step.done) {
      status = "completed";
    } else if (firstIncomplete === -1) {
      status = "completed";
    } else if (index === firstIncomplete) {
      status = "current";
    } else {
      status = "upcoming";
    }

    return {
      id: step.id,
      label: step.label,
      status,
      date: step.date,
      description: step.description,
    };
  });
}

export function getJourneySteps(seller: SellerProfile): JourneyStep[] {
  return assignStatuses(buildStepDefinitions(seller));
}

export function getJourneyProgress(seller: SellerProfile): JourneyProgress {
  const definitions = buildStepDefinitions(seller);
  const steps = assignStatuses(definitions);
  const completedCount = definitions.filter((step) => step.done).length;
  const progressPercent = Math.round((completedCount / TOTAL_STEPS) * 100);
  const currentIndex = definitions.findIndex((step) => !step.done);
  const currentStep =
    currentIndex === -1 ? null : (steps[currentIndex] ?? null);
  const nextAction =
    currentIndex === -1 ? null : (definitions[currentIndex]?.nextAction ?? null);

  return {
    steps,
    completedCount,
    totalSteps: TOTAL_STEPS,
    progressPercent,
    currentStep,
    nextAction,
  };
}

import {
  AlertTriangle,
  BookOpen,
  CreditCard,
  FileCheck,
  Package,
  Star,
  User,
} from "lucide-react";

import bidsData from "@/data/bids.json";
import { DashboardStat } from "@/components/DashboardStats";
import { PriorityAction } from "@/components/ActionList";
import { StatusCardProps } from "@/components/StatusCard";
import { getAccountBids, getAccountPayments, getAccountRating } from "@/lib/demo-data";
import { PaymentOrder, SellerProfile, parseBids } from "@/lib/schemas";
import { rankBids } from "@/lib/rules/match";
import {
  REFERENCE_TODAY,
  calculateInterest,
  checkPaymentRights,
  daysBetween,
  getDaysOverdue,
} from "@/lib/rules/msme-rights";
import { validateDocuments } from "@/lib/rules/registration";

const bids = parseBids(bidsData);

function getPayments(): PaymentOrder[] {
  return getAccountPayments();
}

function getRating() {
  return getAccountRating();
}

function getBidHistory() {
  return getAccountBids();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function isProfileComplete(seller: SellerProfile): boolean {
  return Boolean(
    seller.gstin &&
      seller.pan &&
      seller.bankVerified &&
      seller.products.length > 0 &&
      seller.certifications.length > 0
  );
}

export type RecentActivityItem = {
  id: string;
  label: string;
  detail: string;
  date: string;
  tone: "good" | "warning" | "danger" | "neutral";
};

export type DashboardData = {
  matchScore: number;
  matchCount: number;
  statusCards: StatusCardProps[];
  stats: DashboardStat[];
  priorityActions: PriorityAction[];
  recentActivity: RecentActivityItem[];
};

export function getDashboardData(seller: SellerProfile): DashboardData {
  const ranked = rankBids(seller, bids);
  const pursueMatches = ranked.filter(
    ({ match }) => match.pursue && match.matchScore >= 60
  );
  const matchScore =
    pursueMatches.length > 0
      ? Math.round(
          pursueMatches.reduce((sum, item) => sum + item.match.matchScore, 0) /
            pursueMatches.length
        )
      : ranked[0]?.match.matchScore ?? 0;
  const matchCount = Math.max(pursueMatches.length, 5);

  const docValidation = validateDocuments({
    ...seller,
    email: "seller@demo.local",
    bankAccount: seller.bankVerified ? "123456789012" : "",
    ifsc: seller.bankVerified ? "SBIN0001234" : "",
  });
  const verifiedDocs = docValidation.checks.filter((check) => check.status === "pass").length;
  const totalDocs = docValidation.checks.length;

  const catalogueItems = Math.min(seller.products.length, 2) || 2;
  const catalogueDays = daysBetween(getRating().catalogLastUpdate);

  const pendingPayments = getPayments().filter((order) => order.status !== "paid");
  const pendingAmount = pendingPayments.reduce((sum, order) => sum + order.totalValue, 0);
  const overdueOrders = getPayments().filter((order) => order.status === "overdue");
  const stuckOrders = getPayments().filter((order) => order.status === "stuck");
  const totalInterest = overdueOrders.reduce((sum, order) => {
    const rights = checkPaymentRights(order);
    return sum + rights.interestAmount;
  }, 0);

  const profileComplete = isProfileComplete(seller);
  const rating = getRating().overall;

  const statusCards: StatusCardProps[] = [
    {
      icon: User,
      label: "Profile",
      value: profileComplete ? "Complete ✓" : "Incomplete",
      status: profileComplete ? "good" : "warning",
      action: profileComplete
        ? { label: "View profile", href: "/profile" }
        : { label: "Complete setup", href: "/setup" },
    },
    {
      icon: FileCheck,
      label: "Documents",
      value: `${verifiedDocs}/${totalDocs} verified`,
      status: verifiedDocs >= totalDocs - 1 ? "good" : "warning",
      action: { label: "Check documents", href: "/bid-prep" },
    },
    {
      icon: Package,
      label: "Catalogue",
      value: `${catalogueItems} items listed`,
      status: catalogueDays > 30 ? "warning" : "good",
      action: { label: "Manage catalogue", href: "/catalogue" },
    },
    {
      icon: Star,
      label: "Rating",
      value: `${rating}/5`,
      status: rating >= 4 ? "good" : rating >= 3.5 ? "warning" : "danger",
      action: { label: "Improve rating", href: "/rating-recovery" },
    },
    {
      icon: CreditCard,
      label: "Payments",
      value: `${formatCurrency(pendingAmount)} pending`,
      status: overdueOrders.length > 0 ? "danger" : stuckOrders.length > 0 ? "warning" : "good",
      action: { label: "Track payments", href: "/payments" },
    },
  ];

  const stats: DashboardStat[] = [
    {
      label: "Match score",
      value: `${matchScore}/100`,
      trend: matchScore >= 70 ? "up" : "down",
      trendLabel: matchScore >= 70 ? "Strong fit" : "Room to improve",
      action: { label: "View matches", href: "/opportunities" },
    },
    {
      label: "Matching tenders",
      value: String(matchCount),
      action: { label: "Browse", href: "/opportunities" },
    },
    {
      label: "Pending payments",
      value: formatCurrency(pendingAmount),
      trend: overdueOrders.length > 0 ? "down" : undefined,
      trendLabel: overdueOrders.length > 0 ? `${overdueOrders.length} overdue` : undefined,
      action: { label: "View payments", href: "/payments" },
    },
    {
      label: "Win rate",
      value: `${Math.round((getBidHistory().filter((b) => b.result === "won").length / Math.max(getBidHistory().length, 1)) * 100)}%`,
      trend: "up",
      trendLabel: "Last 12 bids",
      action: { label: "See insights", href: "/learn" },
    },
  ];

  const priorityActions: PriorityAction[] = [];

  if (overdueOrders.length > 0 || stuckOrders.length > 0) {
    const overdueCount = overdueOrders.length + (stuckOrders.length > 0 ? 1 : 0);
    priorityActions.push({
      icon: AlertTriangle,
      label: `${Math.max(overdueCount, 2)} payments overdue — ${formatCurrency(totalInterest || 12800)} interest accruing`,
      priority: "danger",
      action: { label: "Claim interest", href: "/payments" },
    });
  }

  const stuckOrder = stuckOrders[0];
  if (stuckOrder) {
    priorityActions.push({
      icon: CreditCard,
      label: `CRAC pending for order ${stuckOrder.id}`,
      priority: "warning",
      action: { label: "Escalate deadlock", href: "/deadlock" },
    });
  }

  priorityActions.push({
    icon: Package,
    label: `Update catalogue (last updated ${catalogueDays} days ago)`,
    priority: "info",
    action: { label: "Update catalogue", href: "/catalogue" },
  });

  const history = getBidHistory().sort((a, b) => b.bidDate.localeCompare(a.bidDate));
  const recentBids = history.slice(0, 3).map((bid) => ({
    id: bid.bidId,
    label: bid.title,
    detail:
      bid.result === "won"
        ? `Won${bid.margin !== null ? ` · ${bid.margin}% margin` : ""}`
        : bid.result === "lost"
          ? "Lost"
          : "Pending",
    date: bid.bidDate,
    tone:
      bid.result === "won"
        ? ("good" as const)
        : bid.result === "lost"
          ? ("danger" as const)
          : ("neutral" as const),
  }));

  const latestPayment = getPayments().find((order) => order.status !== "paid") ?? getPayments()[0];
  const paymentRights = latestPayment ? checkPaymentRights(latestPayment) : null;

  const recentActivity: RecentActivityItem[] = [
    ...recentBids,
    {
      id: `payment-${latestPayment?.id}`,
      label: latestPayment?.bidTitle ?? "Payment update",
      detail:
        latestPayment?.status === "paid"
          ? "Paid in full"
          : latestPayment?.status === "overdue"
            ? `Overdue · ${formatCurrency(paymentRights?.interestAmount ?? calculateInterest(latestPayment.totalValue, getDaysOverdue(latestPayment)))} interest`
            : latestPayment?.status === "stuck"
              ? "Stuck — CRAC not generated"
              : "Awaiting payment",
      date: latestPayment?.invoiceDate ?? latestPayment?.deliveryDate ?? REFERENCE_TODAY,
      tone:
        latestPayment?.status === "paid"
          ? "good"
          : latestPayment?.status === "overdue"
            ? "danger"
            : "warning",
    },
    {
      id: "catalogue-update",
      label: "Catalogue last updated",
      detail: `${catalogueItems} products · ${catalogueDays} days ago`,
      date: getRating().catalogLastUpdate,
      tone: catalogueDays > 30 ? "warning" : "good",
    },
  ];

  return {
    matchScore,
    matchCount,
    statusCards,
    stats,
    priorityActions,
    recentActivity,
  };
}

export const QUICK_LINKS = [
  { label: "Find tenders", href: "/opportunities", icon: BookOpen },
  { label: "Check readiness", href: "/simulate", icon: FileCheck },
  { label: "Track payments", href: "/payments", icon: CreditCard },
  { label: "Learn rights", href: "/msme-rights", icon: AlertTriangle },
] as const;

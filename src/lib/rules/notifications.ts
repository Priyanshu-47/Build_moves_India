import bidsData from "@/data/bids.json";
import { getAccountNotifications, getAccountPayments } from "@/lib/demo-data";
import { BidOpportunity, PaymentOrder, SellerProfile, parseBids } from "@/lib/schemas";
import { REFERENCE_TODAY, getDaysOverdue } from "@/lib/rules/msme-rights";

export type NotificationKind =
  | "bid_closing"
  | "payment_overdue"
  | "catalogue_rejected"
  | "udyam_expiring"
  | "bid_won"
  | "crac_pending"
  | "profile_incomplete";

export type NotificationSeverity = "success" | "warning" | "error" | "info";

export type NotificationAction = {
  label: string;
  href: string;
};

export type Notification = {
  id: string;
  type: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  action?: NotificationAction;
};

const DISMISSED_KEY = "sahayak-notifications-dismissed";
const READ_KEY = "sahayak-notifications-read";

const bids = parseBids(bidsData);

function getPayments(): PaymentOrder[] {
  return getAccountPayments();
}

const SEVERITY_PRIORITY: Record<NotificationSeverity, number> = {
  error: 0,
  warning: 1,
  info: 2,
  success: 3,
};

function hoursUntilDeadline(deadline: string): number {
  const end = new Date(`${deadline}T23:59:59`);
  const now = new Date(`${REFERENCE_TODAY}T12:00:00`);
  return (end.getTime() - now.getTime()) / (1000 * 60 * 60);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function isProfileIncomplete(seller: SellerProfile): boolean {
  return (
    !seller.gstin ||
    !seller.pan ||
    !seller.bankVerified ||
    seller.products.length === 0
  );
}

function getClosingBids(): BidOpportunity[] {
  return bids.filter(
    (bid) => bid.status === "closing_soon" || hoursUntilDeadline(bid.deadline) <= 48
  );
}

export function getActiveNotifications(seller: SellerProfile | null): Notification[] {
  const accountNotifications = getAccountNotifications();
  if (accountNotifications.length > 0) {
    return sortNotifications(accountNotifications);
  }

  const notifications: Notification[] = [];
  const now = `${REFERENCE_TODAY}T09:00:00`;

  if (!seller) {
    notifications.push({
      id: "profile-incomplete",
      type: "profile_incomplete",
      severity: "info",
      title: "Complete your profile",
      message: "Complete your profile to match more bids",
      timestamp: now,
      action: { label: "Complete setup", href: "/setup" },
    });
    return sortNotifications(notifications);
  }

  const closingBids = getClosingBids();
  const closingCount = Math.max(closingBids.length, 3);
  if (closingBids.length > 0 || bids.some((bid) => bid.status === "open")) {
    notifications.push({
      id: "bid-closing",
      type: "bid_closing",
      severity: "warning",
      title: "Tenders closing soon",
      message: `${closingCount} tenders closing in 48 hours`,
      timestamp: now,
      action: { label: "View opportunities", href: "/opportunities" },
    });
  }

  const overduePayment = getPayments().find((order) => order.status === "overdue");
  if (overduePayment) {
    const daysOverdue = getDaysOverdue(overduePayment);
    notifications.push({
      id: `payment-overdue-${overduePayment.id}`,
      type: "payment_overdue",
      severity: "error",
      title: "Payment overdue",
      message: `${formatCurrency(overduePayment.totalValue)} payment overdue by ${daysOverdue} days`,
      timestamp: now,
      action: { label: "Track payment", href: "/payments" },
    });
  }

  notifications.push({
    id: "catalogue-rejected",
    type: "catalogue_rejected",
    severity: "error",
    title: "Catalogue items need fixing",
    message: "2 items need fixing before buyers can order",
    timestamp: now,
    action: { label: "Fix catalogue", href: "/catalogue-check" },
  });

  notifications.push({
    id: "udyam-expiring",
    type: "udyam_expiring",
    severity: "warning",
    title: "Udyam registration expiring",
    message: "Your Udyam expires in 30 days — renew to keep MSE benefits",
    timestamp: now,
    action: { label: "Renew Udyam", href: "/udyam" },
  });

  notifications.push({
    id: "bid-won-ergonomic",
    type: "bid_won",
    severity: "success",
    title: "Congratulations — you won a bid!",
    message: "You won Ergonomic Chairs for SN Medical College",
    timestamp: now,
    action: { label: "View order", href: "/orders" },
  });

  const stuckPayment = getPayments().find((order) => order.status === "stuck");
  if (stuckPayment) {
    notifications.push({
      id: `crac-pending-${stuckPayment.id}`,
      type: "crac_pending",
      severity: "warning",
      title: "CRAC not generated",
      message: `CRAC not generated for order ${stuckPayment.id} — payment blocked`,
      timestamp: now,
      action: { label: "Escalate deadlock", href: "/deadlock" },
    });
  }

  if (isProfileIncomplete(seller)) {
    notifications.push({
      id: "profile-incomplete",
      type: "profile_incomplete",
      severity: "info",
      title: "Complete your profile",
      message: "Complete your profile to match more bids",
      timestamp: now,
      action: { label: "Update profile", href: "/setup" },
    });
  }

  return sortNotifications(notifications);
}

export function sortNotifications(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => {
    const priorityDiff = SEVERITY_PRIORITY[a.severity] - SEVERITY_PRIORITY[b.severity];
    if (priorityDiff !== 0) return priorityDiff;
    return b.timestamp.localeCompare(a.timestamp);
  });
}

export function getDismissedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function dismissNotification(id: string): void {
  if (typeof window === "undefined") return;
  const dismissed = new Set(getDismissedIds());
  dismissed.add(id);
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]));
}

export function getReadIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function markNotificationRead(id: string): void {
  if (typeof window === "undefined") return;
  const read = new Set(getReadIds());
  read.add(id);
  localStorage.setItem(READ_KEY, JSON.stringify([...read]));
}

export function markAllNotificationsRead(ids: string[]): void {
  if (typeof window === "undefined") return;
  const read = new Set([...getReadIds(), ...ids]);
  localStorage.setItem(READ_KEY, JSON.stringify([...read]));
}

export function filterVisibleNotifications(
  notifications: Notification[],
  dismissedIds: string[]
): Notification[] {
  const dismissed = new Set(dismissedIds);
  return notifications.filter((notification) => !dismissed.has(notification.id));
}

export function formatNotificationTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

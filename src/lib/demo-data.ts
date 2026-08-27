import ordersData from "@/data/orders.json";
import paymentsData from "@/data/payments.json";
import bidHistoryData from "@/data/bid-history.json";
import ratingData from "@/data/seller-rating.json";
import { PaymentOrder } from "@/lib/schemas";
import { getCurrentAccount } from "@/lib/auth";
import { BidHistoryEntry } from "@/lib/rules/learning";
import { Notification } from "@/lib/rules/notifications";

export type SellerOrder = (typeof ordersData)[number];

export type SellerRating = {
  overall: number;
  onTimeDelivery: number;
  qualityCompliance: number;
  buyerSatisfaction: number;
  responseRate: number;
  orderCancellation: number;
  totalOrders: number;
  totalRevenue: number;
  catalogLastUpdate: string;
  lateDeliveriesThisMonth: number;
  monthlyTrend: { month: string; orders: number; revenue: number }[];
};

const defaultOrders = ordersData as SellerOrder[];
const defaultPayments = paymentsData as PaymentOrder[];
const defaultBids = bidHistoryData as BidHistoryEntry[];
const defaultRating = ratingData as SellerRating;

export function getAccountOrders(): SellerOrder[] {
  const account = getCurrentAccount();
  return (account?.orders as SellerOrder[]) ?? defaultOrders;
}

export function getAccountPayments(): PaymentOrder[] {
  const account = getCurrentAccount();
  return (account?.payments as PaymentOrder[]) ?? defaultPayments;
}

export function getAccountBids(): BidHistoryEntry[] {
  const account = getCurrentAccount();
  return (account?.bids as BidHistoryEntry[]) ?? defaultBids;
}

export function getAccountRating(): SellerRating {
  const account = getCurrentAccount();
  return (account?.rating as SellerRating) ?? defaultRating;
}

export function getAccountNotifications(): Notification[] {
  const account = getCurrentAccount();
  if (account?.notifications) {
    return account.notifications as Notification[];
  }
  return [];
}

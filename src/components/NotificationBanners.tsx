"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { NotificationBanner } from "@/components/ui/notification-banner";
import {
  Notification,
  dismissNotification,
  filterVisibleNotifications,
  getActiveNotifications,
  getDismissedIds,
} from "@/lib/rules/notifications";
import { getSeller } from "@/lib/store";

type NotificationBannersProps = {
  max?: number;
  className?: string;
};

const SEVERITY_VARIANT: Record<
  Notification["severity"],
  "error" | "warning" | "success" | "info"
> = {
  error: "error",
  warning: "warning",
  success: "success",
  info: "info",
};

export function NotificationBanners({ max = 2, className }: NotificationBannersProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const refresh = useCallback(() => {
    const seller = getSeller();
    setNotifications(getActiveNotifications(seller));
    setDismissedIds(getDismissedIds());
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (
        event.key?.startsWith("sahayak-notification") ||
        event.key === "sahayak-seller"
      ) {
        refresh();
      }
    };
    const onChange = () => {
      setDismissedIds(getDismissedIds());
      setNotifications(getActiveNotifications(getSeller()));
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("sahayak-notifications-changed", onChange);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sahayak-notifications-changed", onChange);
    };
  }, [refresh]);

  const critical = useMemo(() => {
    const visible = filterVisibleNotifications(notifications, dismissedIds);
    return visible
      .filter((n) => n.severity === "error" || n.severity === "warning")
      .slice(0, max);
  }, [notifications, dismissedIds, max]);

  if (critical.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)} role="region" aria-label="Critical alerts" aria-live="polite">
      {critical.map((notification) => (
        <NotificationBanner
          key={notification.id}
          type={SEVERITY_VARIANT[notification.severity]}
          title={notification.title}
          message={notification.message}
          action={
            notification.action
              ? { label: notification.action.label, href: notification.action.href }
              : undefined
          }
          onDismiss={() => {
            dismissNotification(notification.id);
            setDismissedIds((current) => [...new Set([...current, notification.id])]);
          }}
        />
      ))}
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

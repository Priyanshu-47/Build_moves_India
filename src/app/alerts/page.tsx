"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Notification,
  NotificationSeverity,
  dismissNotification,
  filterVisibleNotifications,
  formatNotificationTime,
  getActiveNotifications,
  getDismissedIds,
  getReadIds,
  markAllNotificationsRead,
} from "@/lib/rules/notifications";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

type Filter = "all" | NotificationSeverity;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "error", label: "Errors" },
  { id: "warning", label: "Warnings" },
  { id: "info", label: "Info" },
];

function NotificationIcon({ severity }: { severity: NotificationSeverity }) {
  switch (severity) {
    case "error":
      return <AlertCircle className="size-5 text-destructive" aria-hidden="true" />;
    case "warning":
      return <AlertTriangle className="size-5 text-amber-600" aria-hidden="true" />;
    case "success":
      return <CheckCircle2 className="size-5 text-green-600" aria-hidden="true" />;
    default:
      return <Info className="size-5 text-blue-600" aria-hidden="true" />;
  }
}

export default function AlertsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [ready, setReady] = useState(false);

  const refresh = useCallback(() => {
    const seller = getSeller();
    setNotifications(getActiveNotifications(seller));
    setDismissedIds(getDismissedIds());
    setReadIds(getReadIds());
    setReady(true);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const visible = useMemo(
    () => filterVisibleNotifications(notifications, dismissedIds),
    [notifications, dismissedIds]
  );

  const filtered = useMemo(() => {
    if (filter === "all") return visible;
    if (filter === "info") {
      return visible.filter(
        (notification) =>
          notification.severity === "info" || notification.severity === "success"
      );
    }
    return visible.filter((notification) => notification.severity === filter);
  }, [filter, visible]);

  function handleMarkAllRead() {
    markAllNotificationsRead(visible.map((notification) => notification.id));
    setReadIds(getReadIds());
  }

  function handleDismiss(id: string) {
    dismissNotification(id);
    setDismissedIds((current) => [...new Set([...current, id])]);
  }

  if (!ready) {
    return (
      <PageShell>
        <p className="text-sm text-muted-foreground">Loading notifications…</p>
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <PageHeader
        title="Notifications"
        backUrl="/"
        subtitle="Time-sensitive alerts for payments, tenders, and compliance."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={filter === item.id ? "default" : "outline"}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        {visible.length > 0 && (
          <Button type="button" variant="secondary" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Bell className="size-10 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">No notifications — you&apos;re all caught up</p>
            <p className="text-sm text-muted-foreground">
              We&apos;ll alert you when tenders close, payments are delayed, or action is
              needed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => {
            const isRead = readIds.includes(notification.id);
            return (
              <Card
                key={notification.id}
                className={cn(!isRead && "border-primary/30 bg-primary/5")}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <NotificationIcon severity={notification.severity} />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base">{notification.title}</CardTitle>
                          {!isRead && <Badge variant="secondary">New</Badge>}
                        </div>
                        <CardDescription className="mt-1">
                          {formatNotificationTime(notification.timestamp)}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDismiss(notification.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{notification.message}</p>
                  {notification.action && (
                    <Link
                      href={notification.action.href}
                      className="text-sm font-medium text-primary underline underline-offset-2 hover:no-underline"
                    >
                      {notification.action.label}
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { SwipeToDismiss } from "@/components/SwipeToDismiss";
import { CardSkeleton } from "@/components/skeletons";
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
    case "error": return <AlertCircle className="size-4 text-red-600" />;
    case "warning": return <AlertTriangle className="size-4 text-amber-600" />;
    case "success": return <CheckCircle2 className="size-4 text-emerald-600" />;
    default: return <Info className="size-4 text-blue-600" />;
  }
}

function severityBg(severity: NotificationSeverity): string {
  switch (severity) {
    case "error": return "border-l-red-500 bg-red-50/50 dark:bg-red-950/20";
    case "warning": return "border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20";
    case "success": return "border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20";
    default: return "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20";
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

  useEffect(() => { refresh(); }, [refresh]);

  const visible = useMemo(() => filterVisibleNotifications(notifications, dismissedIds), [notifications, dismissedIds]);

  const filtered = useMemo(() => {
    if (filter === "all") return visible;
    if (filter === "info") return visible.filter((n) => n.severity === "info" || n.severity === "success");
    return visible.filter((n) => n.severity === filter);
  }, [filter, visible]);

  function handleMarkAllRead() {
    markAllNotificationsRead(visible.map((n) => n.id));
    setReadIds(getReadIds());
  }

  function handleDismiss(id: string) {
    dismissNotification(id);
    setDismissedIds((current) => [...new Set([...current, id])]);
  }

  if (!ready) {
    return (
      <PageShell>
        <CardSkeleton rows={4} />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href="/" className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="size-3" aria-hidden="true" /> Back
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Time-sensitive alerts for payments, tenders, and compliance.</p>
        </div>
        {visible.length > 0 && (
          <button type="button" onClick={handleMarkAllRead} className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted/50">
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
              filter === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card py-12 text-center">
          <Bell className="size-10 text-muted-foreground/40" />
          <p className="font-medium">No notifications — you&apos;re all caught up</p>
          <p className="max-w-xs text-sm text-muted-foreground">We&apos;ll alert you when tenders close, payments are delayed, or action is needed.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notification) => {
            const isRead = readIds.includes(notification.id);
            return (
              <SwipeToDismiss key={notification.id} onDismiss={() => handleDismiss(notification.id)}>
                <div className={cn("flex items-start gap-3 rounded-xl border-l-4 bg-card px-4 py-3 shadow-sm", severityBg(notification.severity), !isRead && "ring-1 ring-primary/20")}>
                  <NotificationIcon severity={notification.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm", isRead ? "font-medium" : "font-bold")}>{notification.title}</p>
                      {!isRead && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">New</span>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{notification.message}</p>
                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground">{formatNotificationTime(notification.timestamp)}</span>
                      {notification.action && (
                        <Link href={notification.action.href} className="text-[10px] font-semibold text-primary hover:underline">
                          {notification.action.label} →
                        </Link>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDismiss(notification.id)}
                    className="flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted"
                    aria-label="Dismiss"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </SwipeToDismiss>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}

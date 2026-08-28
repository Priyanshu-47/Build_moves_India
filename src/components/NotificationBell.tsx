"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FocusTrap } from "@/components/ui/focus-trap";
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
  markNotificationRead,
} from "@/lib/rules/notifications";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

function NotificationRowIcon({ severity }: { severity: NotificationSeverity }) {
  switch (severity) {
    case "error":
      return (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-4 text-destructive" aria-hidden="true" />
        </span>
      );
    case "warning":
      return (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40">
          <AlertTriangle className="size-4 text-amber-600" aria-hidden="true" />
        </span>
      );
    case "success":
      return (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
          <CheckCircle2 className="size-4 text-green-600" aria-hidden="true" />
        </span>
      );
    default:
      return (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40">
          <Info className="size-4 text-blue-600" aria-hidden="true" />
        </span>
      );
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(() => {
    const seller = getSeller();
    setNotifications(getActiveNotifications(seller));
    setDismissedIds(getDismissedIds());
    setReadIds(getReadIds());
    setReady(true);
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
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const visible = useMemo(
    () => filterVisibleNotifications(notifications, dismissedIds),
    [notifications, dismissedIds]
  );

  const unreadCount = useMemo(
    () => visible.filter((item) => !readIds.includes(item.id)).length,
    [visible, readIds]
  );

  function handleMarkAllRead() {
    markAllNotificationsRead(visible.map((item) => item.id));
    setReadIds(getReadIds());
  }

  function handleDismiss(id: string) {
    dismissNotification(id);
    setDismissedIds((current) => [...new Set([...current, id])]);
  }

  function handleOpenItem(notification: Notification) {
    markNotificationRead(notification.id);
    setReadIds(getReadIds());
  }

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        type="button"
        variant="ghost"
        size="icon"
        className="relative size-10 min-h-11 min-w-11"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="size-4" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <FocusTrap active={open} onEscape={() => setOpen(false)} returnFocusRef={buttonRef}>
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Notifications"
            className="absolute top-full right-0 z-[60] mt-2 w-[calc(100vw-2rem)] max-w-[400px] overflow-hidden rounded-lg border bg-popover shadow-lg sm:w-[400px]"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-sm font-semibold">Notifications</h2>
              {visible.length > 0 && (
                <Button type="button" variant="ghost" size="sm" onClick={handleMarkAllRead}>
                  Mark all read
                </Button>
              )}
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {!ready || visible.length === 0 ? (
                <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                <ul className="divide-y">
                  {visible.map((notification) => {
                    const isRead = readIds.includes(notification.id);
                    return (
                      <li
                        key={notification.id}
                        className={cn(
                          "px-4 py-3",
                          !isRead && "bg-primary/5"
                        )}
                      >
                        <div className="flex gap-3">
                          <NotificationRowIcon severity={notification.severity} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Dismiss ${notification.title}`}
                                onClick={() => handleDismiss(notification.id)}
                              >
                                <X className="size-3.5" aria-hidden="true" />
                              </Button>
                            </div>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatNotificationTime(notification.timestamp)}
                            </p>
                            {notification.action && (
                              <Link
                                href={notification.action.href}
                                className="mt-2 inline-block text-sm font-medium text-primary underline underline-offset-2 hover:no-underline"
                                onClick={() => handleOpenItem(notification)}
                              >
                                {notification.action.label}
                              </Link>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t px-4 py-3 text-center">
              <Link
                href="/alerts"
                className="text-sm font-medium text-primary underline underline-offset-2 hover:no-underline"
                onClick={() => setOpen(false)}
              >
                View all
              </Link>
            </div>
          </div>
        </FocusTrap>
      )}
    </div>
  );
}

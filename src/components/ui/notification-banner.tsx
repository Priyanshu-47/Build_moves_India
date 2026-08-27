"use client";

import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type NotificationBannerType = "success" | "warning" | "error" | "info";

export type NotificationBannerAction = {
  label: string;
  href: string;
};

type NotificationBannerProps = {
  type: NotificationBannerType;
  title: string;
  message: string;
  action?: NotificationBannerAction;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
};

const STYLES: Record<
  NotificationBannerType,
  { border: string; bg: string; icon: typeof Info; role: "status" | "alert" }
> = {
  success: {
    border: "border-l-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    icon: CheckCircle2,
    role: "status",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: AlertTriangle,
    role: "status",
  },
  error: {
    border: "border-l-destructive",
    bg: "bg-destructive/5",
    icon: AlertCircle,
    role: "alert",
  },
  info: {
    border: "border-l-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: Info,
    role: "status",
  },
};

export function NotificationBanner({
  type,
  title,
  message,
  action,
  dismissible = true,
  onDismiss,
  className,
}: NotificationBannerProps) {
  const style = STYLES[type];
  const Icon = style.icon;

  return (
    <div
      role={style.role}
      aria-live={type === "error" ? "assertive" : "polite"}
      className={cn(
        "border-b border-l-4 px-4 py-3",
        style.border,
        style.bg,
        className
      )}
    >
      <div className="app-container flex gap-3">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{message}</p>
          {action && (
            <Link
              href={action.href}
              className="mt-2 inline-block text-sm font-medium underline underline-offset-2 hover:no-underline"
            >
              {action.label}
            </Link>
          )}
        </div>
        {dismissible && onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDismiss}
            className="shrink-0"
            aria-label={`Dismiss: ${title}`}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

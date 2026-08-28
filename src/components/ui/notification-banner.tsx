"use client";

import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

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
  { border: string; bg: string; icon: typeof Info; role: "status" | "alert"; dot: string }
> = {
  success: {
    border: "border-l-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    icon: CheckCircle2,
    role: "status",
    dot: "bg-emerald-500",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    icon: AlertTriangle,
    role: "status",
    dot: "bg-amber-500",
  },
  error: {
    border: "border-l-red-500",
    bg: "bg-red-50 dark:bg-red-950/40",
    icon: AlertCircle,
    role: "alert",
    dot: "bg-red-500",
  },
  info: {
    border: "border-l-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    icon: Info,
    role: "status",
    dot: "bg-blue-500",
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
        "flex items-start gap-3 rounded-xl border-l-4 bg-card px-4 py-3 shadow-md transition-all",
        style.border,
        "animate-fade-in-up",
        className
      )}
    >
      <div className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg", style.bg)}>
        <Icon className={cn("size-4", type === "error" && "text-red-600", type === "warning" && "text-amber-600", type === "success" && "text-emerald-600", type === "info" && "text-blue-600")} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-snug">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{message}</p>
        {action && (
          <Link
            href={action.href}
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {action.label}
            <span className="text-[10px]">→</span>
          </Link>
        )}
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted"
          aria-label={`Dismiss: ${title}`}
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

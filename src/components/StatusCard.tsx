import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatusLevel = "good" | "warning" | "danger";

export type StatusCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  status: StatusLevel;
  action?: { label: string; href: string };
};

const STATUS_BADGE: Record<StatusLevel, "default" | "secondary" | "destructive"> = {
  good: "default",
  warning: "secondary",
  danger: "destructive",
};

const STATUS_LABELS: Record<StatusLevel, string> = {
  good: "Good",
  warning: "Attention",
  danger: "Action needed",
};

const STATUS_ICON: Record<StatusLevel, string> = {
  good: "bg-gradient-to-br from-green-100 to-emerald-50 text-green-700 dark:from-green-950 dark:to-emerald-950 dark:text-green-400",
  warning: "bg-gradient-to-br from-amber-100 to-orange-50 text-amber-700 dark:from-amber-950 dark:to-orange-950 dark:text-amber-400",
  danger: "bg-gradient-to-br from-red-100 to-rose-50 text-destructive dark:from-red-950 dark:to-rose-950",
};

const STATUS_BORDER: Record<StatusLevel, string> = {
  good: "border-l-green-500",
  warning: "border-l-amber-500",
  danger: "border-l-destructive",
};

export function StatusCard({ icon: Icon, label, value, status, action }: StatusCardProps) {
  return (
    <Card
      size="sm"
      className={cn(
        "border-l-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        STATUS_BORDER[status]
      )}
    >
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              STATUS_ICON[status]
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <Badge variant={STATUS_BADGE[status]}>{STATUS_LABELS[status]}</Badge>
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums">{value}</p>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
        </div>
        {action && (
          <Link
            href={action.href}
            className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            {action.label} →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

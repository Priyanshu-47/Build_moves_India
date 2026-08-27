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
  good: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
};

export function StatusCard({ icon: Icon, label, value, status, action }: StatusCardProps) {
  return (
    <Card size="sm">
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              STATUS_ICON[status]
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <Badge variant={STATUS_BADGE[status]}>{STATUS_LABELS[status]}</Badge>
        </div>
        <div>
          <p className="text-lg font-semibold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
        {action && (
          <Link
            href={action.href}
            className="text-xs font-medium text-primary underline underline-offset-2 hover:no-underline"
          >
            {action.label}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

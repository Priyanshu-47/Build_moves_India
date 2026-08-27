import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ActionPriority = "danger" | "warning" | "info";

export type PriorityAction = {
  icon: LucideIcon;
  label: string;
  priority: ActionPriority;
  action: { label: string; href: string };
};

type ActionListProps = {
  actions: PriorityAction[];
  title?: string;
};

const PRIORITY_ORDER: Record<ActionPriority, number> = {
  danger: 0,
  warning: 1,
  info: 2,
};

const PRIORITY_BADGE: Record<ActionPriority, { label: string; className: string }> = {
  danger: { label: "Urgent", className: "bg-destructive text-destructive-foreground" },
  warning: { label: "Soon", className: "bg-amber-500 text-white" },
  info: { label: "Suggested", className: "bg-green-600 text-white" },
};

const PRIORITY_BORDER: Record<ActionPriority, string> = {
  danger: "border-l-destructive",
  warning: "border-l-amber-500",
  info: "border-l-green-600",
};

export function ActionList({ actions, title = "Priority actions" }: ActionListProps) {
  const sorted = [...actions].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  if (sorted.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sorted.map((item) => {
          const Icon = item.icon;
          const badge = PRIORITY_BADGE[item.priority];
          return (
            <div
              key={item.label}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-l-4 bg-muted/20 p-3",
                PRIORITY_BORDER[item.priority]
              )}
            >
              <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{item.label}</p>
                  <Badge className={badge.className}>{badge.label}</Badge>
                </div>
                <Link
                  href={item.action.href}
                  className="text-sm font-medium text-primary underline underline-offset-2 hover:no-underline"
                >
                  {item.action.label}
                </Link>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

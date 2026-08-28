import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { BentoSectionTitle } from "@/components/BentoPageHeader";
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
  embedded?: boolean;
};

const PRIORITY_ORDER: Record<ActionPriority, number> = {
  danger: 0,
  warning: 1,
  info: 2,
};

const PRIORITY_BADGE: Record<ActionPriority, { label: string; className: string }> = {
  danger: { label: "Urgent", className: "bg-destructive text-destructive-foreground" },
  warning: { label: "Soon", className: "bg-amber-500 text-white" },
  info: { label: "Suggested", className: "bg-emerald-600 text-white" },
};

const PRIORITY_STYLES: Record<ActionPriority, string> = {
  danger: "border-destructive/30 bg-gradient-to-br from-destructive/10 to-transparent",
  warning: "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent",
  info: "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent",
};

export function ActionList({
  actions,
  title = "Priority actions",
  embedded = false,
}: ActionListProps) {
  const sorted = [...actions].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  );

  if (sorted.length === 0) return null;

  const content = (
    <div className="space-y-2">
      {sorted.map((item) => {
        const Icon = item.icon;
        const badge = PRIORITY_BADGE[item.priority];
        return (
          <div
            key={item.label}
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 transition-all duration-200 hover:shadow-md",
              PRIORITY_STYLES[item.priority]
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background/80">
              <Icon className="size-5 text-foreground" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold leading-snug">{item.label}</p>
                <Badge className={cn("relative text-[10px]", badge.className)}>
                  {item.priority === "danger" && (
                    <span
                      className="absolute -top-1 -right-1 size-2 rounded-full bg-destructive pulse-dot"
                      aria-hidden="true"
                    />
                  )}
                  {badge.label}
                </Badge>
              </div>
              <Link
                href={item.action.href}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                {item.action.label} →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (embedded) return content;

  return (
    <div className="h-full rounded-3xl border bg-card p-5 shadow-sm md:p-6">
      <BentoSectionTitle>{title}</BentoSectionTitle>
      {content}
    </div>
  );
}

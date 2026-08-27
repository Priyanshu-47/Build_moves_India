import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type DashboardStat = {
  label: string;
  value: string;
  trend?: "up" | "down";
  trendLabel?: string;
  action?: { label: string; href: string };
};

type DashboardStatsProps = {
  stats: DashboardStat[];
};

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div
      className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4"
      aria-live="polite"
      aria-label="Dashboard statistics"
    >
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardContent className="space-y-1 pt-4">
            <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            {stat.trend && stat.trendLabel && (
              <p
                className={cn(
                  "flex items-center gap-0.5 text-xs font-medium",
                  stat.trend === "up" ? "text-green-600" : "text-destructive"
                )}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="size-3.5" aria-hidden="true" />
                )}
                {stat.trendLabel}
              </p>
            )}
            {stat.action && (
              <Link
                href={stat.action.href}
                className="inline-block text-xs font-medium text-primary underline underline-offset-2 hover:no-underline"
              >
                {stat.action.label}
              </Link>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

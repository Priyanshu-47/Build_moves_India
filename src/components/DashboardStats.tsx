import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkline } from "@/components/ui/sparkline";
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

const ACCENTS = [
  "from-blue-500/10 via-transparent to-transparent",
  "from-emerald-500/10 via-transparent to-transparent",
  "from-amber-500/10 via-transparent to-transparent",
  "from-violet-500/10 via-transparent to-transparent",
];

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div
      className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4"
      aria-live="polite"
      aria-label="Dashboard statistics"
    >
      {stats.map((stat, index) => (
        <Card
          key={stat.label}
          size="sm"
          className={cn(
            "stat-card-accent min-w-[170px] shrink-0 border-primary/10 bg-gradient-to-br md:min-w-0",
            ACCENTS[index % ACCENTS.length]
          )}
        >
          <CardContent className="space-y-2 pt-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
                {stat.value}
              </p>
              {stat.trend && (
                <Sparkline trend={stat.trend} className="mt-1 shrink-0 opacity-80" />
              )}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            {stat.trend && stat.trendLabel && (
              <p
                className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold",
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
                className="inline-block text-xs font-semibold text-primary underline-offset-2 hover:underline"
              >
                {stat.action.label} →
              </Link>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

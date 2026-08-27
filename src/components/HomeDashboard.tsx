"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ActionList } from "@/components/ActionList";
import { DashboardStats } from "@/components/DashboardStats";
import { PageShell } from "@/components/PageShell";
import { SellerJourney } from "@/components/SellerJourney";
import { StatusCard } from "@/components/StatusCard";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SellerProfile } from "@/lib/schemas";
import { getDashboardData, QUICK_LINKS } from "@/lib/rules/dashboard";
import { cn } from "@/lib/utils";

type HomeDashboardProps = {
  seller: SellerProfile;
};

function formatActivityDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const TONE_STYLES = {
  good: "text-green-700 dark:text-green-400",
  warning: "text-amber-700 dark:text-amber-400",
  danger: "text-destructive",
  neutral: "text-muted-foreground",
};

export function HomeDashboard({ seller }: HomeDashboardProps) {
  const data = getDashboardData(seller);

  return (
    <PageShell className="space-y-8">
      <section className="space-y-1">
        <p className="text-sm font-medium text-primary">Your command center</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
          Welcome back, {seller.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">{seller.businessName}</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">At a glance</h2>
        <DashboardStats stats={data.stats} />
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Your status</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {data.statusCards.map((card) => (
              <StatusCard key={card.label} {...card} />
            ))}
          </div>
        </section>

        <ActionList actions={data.priorityActions} />
      </div>

      <Card className="border-primary/30 bg-primary/5" aria-live="polite">
        <CardHeader>
          <CardTitle className="text-base">Your match score</CardTitle>
          <CardDescription>
            {data.matchCount} tenders match your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-4xl font-bold tabular-nums lg:text-5xl">{data.matchScore}/100</p>
          <Link href="/opportunities" className={buttonVariants()}>
            View matches
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>

      <SellerJourney seller={seller} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <Card>
            <CardContent className="divide-y pt-4">
              {data.recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className={cn("text-xs", TONE_STYLES[item.tone])}>{item.detail}</p>
                  </div>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatActivityDate(item.date)}
                  </time>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Quick links</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium transition-colors hover:bg-muted/50"
              >
                <Icon className="size-5 text-primary" aria-hidden="true" />
                {label}
                <ArrowRight className="ml-auto size-4 text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

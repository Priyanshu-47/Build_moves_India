"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

import alertsData from "@/data/bid-alerts.json";
import { MatchScore } from "@/components/MatchScore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchDimensions } from "@/lib/schemas";

export type Alert = (typeof alertsData)[number];
export type AlertFilter = "all" | "new" | "closing" | "high";

function isClosingSoon(deadline: string): boolean {
  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999);
  const hoursLeft = (end.getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursLeft >= 0 && hoursLeft <= 72;
}

function formatDeadline(deadline: string): string {
  return new Date(deadline).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function alertDimensions(score: number): MatchDimensions {
  return {
    product: score,
    location: score,
    capacity: score,
    eligibility: score,
    certifications: score,
  };
}

export function BidAlertsPanel() {
  const [filter, setFilter] = useState<AlertFilter>("all");

  const filtered = useMemo(() => {
    return alertsData.filter((alert) => {
      switch (filter) {
        case "new":
          return alert.isNew;
        case "closing":
          return isClosingSoon(alert.deadline);
        case "high":
          return alert.matchScore > 80;
        default:
          return true;
      }
    });
  }, [filter]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        New and closing tenders matched to your profile.
      </p>

      <Tabs
        value={filter}
        onValueChange={(value) => setFilter(value as AlertFilter)}
        className="w-full"
      >
        <TabsList className="grid h-9 w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          <TabsTrigger value="new" className="text-xs">
            New
          </TabsTrigger>
          <TabsTrigger value="closing" className="text-xs">
            Closing Soon
          </TabsTrigger>
          <TabsTrigger value="high" className="text-xs">
            High Match
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No alerts in this category.
          </p>
        )}
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const closing = isClosingSoon(alert.deadline);

  return (
    <Link href={`/opportunities/${alert.bidId}`} className="block">
      <Card className="transition-colors hover:bg-muted/30">
        <CardContent className="flex gap-3 pt-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-start gap-2">
              <h2 className="text-base font-semibold leading-snug break-words">
                {alert.title}
              </h2>
              {alert.isNew && <Badge>New</Badge>}
              {closing && <Badge variant="destructive">Closing Soon</Badge>}
            </div>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <Bell className="size-3.5 shrink-0" aria-hidden="true" />
              {alert.postedAgo} · Deadline {formatDeadline(alert.deadline)}
            </CardDescription>
            <p className="text-sm font-medium">{alert.value}</p>
          </div>
          <MatchScore
            score={alert.matchScore}
            dimensions={alertDimensions(alert.matchScore)}
            className="shrink-0"
          />
        </CardContent>
      </Card>
    </Link>
  );
}

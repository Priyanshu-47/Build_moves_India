"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { JourneyTimeline } from "@/components/ui/journey-timeline";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SellerProfile } from "@/lib/schemas";
import { getJourneyProgress } from "@/lib/rules/journey";

type SellerJourneyProps = {
  seller: SellerProfile;
};

export function SellerJourney({ seller }: SellerJourneyProps) {
  const journey = getJourneyProgress(seller);

  return (
    <section className="space-y-3" aria-labelledby="gem-journey-heading">
      <div className="space-y-1">
        <h2 id="gem-journey-heading" className="text-lg font-semibold">
          Your GeM Journey
        </h2>
        <p className="text-sm text-muted-foreground">
          You&apos;re {journey.progressPercent}% through your GeM journey (
          {journey.completedCount}/{journey.totalSteps} steps complete)
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-base">Seller progress</CardTitle>
          </div>
          <CardDescription>
            From profile setup to your first payment — track where you are.
          </CardDescription>
          <Progress value={journey.progressPercent} className="mt-2 h-2" />
        </CardHeader>

        <CardContent className="space-y-6">
          <JourneyTimeline steps={journey.steps} />

          {journey.nextAction && journey.currentStep ? (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                What&apos;s next
              </p>
              <p className="mt-1 text-sm font-semibold">{journey.currentStep.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {journey.nextAction.description}
              </p>
              <Link
                href={journey.nextAction.href}
                className={buttonVariants({ className: "mt-3" })}
              >
                Do this next: {journey.nextAction.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-semibold">Journey complete</p>
              <p className="mt-1 text-muted-foreground">
                You&apos;ve completed all seven milestones. Keep bidding and tracking payments.
              </p>
              <Link href="/opportunities" className={buttonVariants({ className: "mt-3" })}>
                Find new tenders
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

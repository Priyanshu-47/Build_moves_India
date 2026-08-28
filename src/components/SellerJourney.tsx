"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { BentoSectionTitle } from "@/components/BentoPageHeader";
import { JourneyTimeline } from "@/components/ui/journey-timeline";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SellerProfile } from "@/lib/schemas";
import { getJourneyProgress } from "@/lib/rules/journey";

type SellerJourneyProps = {
  seller: SellerProfile;
};

export function SellerJourney({ seller }: SellerJourneyProps) {
  const journey = getJourneyProgress(seller);

  return (
    <section
      className="rounded-3xl border bg-card p-5 shadow-sm md:p-6"
      aria-labelledby="gem-journey-heading"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <BentoSectionTitle>Your GeM journey</BentoSectionTitle>
          <p id="gem-journey-heading" className="text-lg font-bold">
            {journey.progressPercent}% complete
          </p>
          <p className="text-sm text-muted-foreground">
            {journey.completedCount}/{journey.totalSteps} milestones done
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
          <MapPin className="size-4" aria-hidden="true" />
          {seller.city}
        </div>
      </div>

      <Progress value={journey.progressPercent} className="mb-6 h-2.5 rounded-full" />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <JourneyTimeline steps={journey.steps} />
        </div>

        <div className="lg:col-span-2">
          {journey.nextAction && journey.currentStep ? (
            <div className="h-full rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                What&apos;s next
              </p>
              <p className="mt-2 text-base font-bold">{journey.currentStep.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {journey.nextAction.description}
              </p>
              <Link
                href={journey.nextAction.href}
                className={buttonVariants({ className: "mt-4 w-full sm:w-auto" })}
              >
                {journey.nextAction.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="h-full rounded-2xl border bg-muted/30 p-5">
              <p className="font-bold">Journey complete</p>
              <p className="mt-1 text-sm text-muted-foreground">
                All seven milestones done. Keep bidding and tracking payments.
              </p>
              <Link
                href="/opportunities"
                className={buttonVariants({ className: "mt-4 w-full sm:w-auto" })}
              >
                Find new tenders
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

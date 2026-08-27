"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { JourneyStepStatus } from "@/lib/rules/journey";

export type JourneyTimelineStep = {
  label: string;
  status: JourneyStepStatus;
  date?: string;
  description?: string;
};

type JourneyTimelineProps = {
  steps: JourneyTimelineStep[];
  className?: string;
};

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StepIndicator({ status }: { status: JourneyStepStatus }) {
  if (status === "completed") {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white sm:size-9">
        <Check className="size-4" aria-hidden="true" />
      </div>
    );
  }

  if (status === "current") {
    return (
      <div className="relative flex size-8 shrink-0 items-center justify-center sm:size-9">
        <span
          className="absolute inset-0 animate-ping rounded-full bg-primary/30"
          aria-hidden="true"
        />
        <div className="relative flex size-8 items-center justify-center rounded-full border-2 border-primary bg-primary text-primary-foreground sm:size-9">
          <span className="size-2.5 rounded-full bg-primary-foreground" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-background sm:size-9">
      <span className="size-2 rounded-full bg-muted-foreground/30" aria-hidden="true" />
    </div>
  );
}

export function JourneyTimeline({ steps, className }: JourneyTimelineProps) {
  return (
    <ol className={cn("relative space-y-0", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const lineCompleted = step.status === "completed";

        return (
          <li key={`${step.label}-${index}`} className="relative flex gap-3 sm:gap-4">
            <div className="flex flex-col items-center">
              <StepIndicator status={step.status} />
              {!isLast && (
                <div
                  className={cn(
                    "my-1 w-0.5 flex-1 min-h-6 sm:min-h-8",
                    lineCompleted ? "bg-green-600" : "bg-muted-foreground/20"
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            <div className={cn("min-w-0 flex-1", !isLast && "pb-5 sm:pb-6")}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <p
                  className={cn(
                    "text-sm font-medium sm:text-base",
                    step.status === "upcoming" && "text-muted-foreground",
                    step.status === "current" && "text-primary"
                  )}
                >
                  {step.label}
                </p>
                {step.date && (
                  <time
                    className="text-xs text-muted-foreground sm:text-sm"
                    dateTime={step.date}
                  >
                    {formatDate(step.date)}
                  </time>
                )}
              </div>
              {step.description && (
                <p
                  className={cn(
                    "mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm",
                    step.status === "upcoming" && "hidden sm:block"
                  )}
                >
                  {step.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

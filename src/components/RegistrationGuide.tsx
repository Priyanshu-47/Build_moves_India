"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  XCircle,
} from "lucide-react";

import registrationSteps from "@/data/registration-steps.json";
import { cn } from "@/lib/utils";

type RegistrationGuideProps = {
  currentStep?: number;
  className?: string;
};

function formatEstimatedTime(minutes: number): string {
  if (minutes >= 1440) return "48–72 hours";
  if (minutes >= 60) return `${Math.round(minutes / 60)} hr`;
  return `${minutes} min`;
}

function StepStatusIcon({
  status,
}: {
  status: "done" | "current" | "pending";
}) {
  if (status === "done") {
    return <CheckCircle2 className="size-5 shrink-0 text-green-600" aria-hidden="true" />;
  }
  if (status === "current") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
        →
      </span>
    );
  }
  return <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />;
}

export function RegistrationGuide({
  currentStep = 3,
  className,
}: RegistrationGuideProps) {
  const [openStep, setOpenStep] = useState<number | null>(currentStep);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Registration progress</p>
        <p className="text-xs text-muted-foreground">
          Step {currentStep} of {registrationSteps.length}
        </p>
      </div>

      <ol className="flex gap-1">
        {registrationSteps.map((item) => (
          <li
            key={item.step}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              item.step < currentStep && "bg-green-600",
              item.step === currentStep && "bg-primary",
              item.step > currentStep && "bg-muted"
            )}
            aria-hidden="true"
          />
        ))}
      </ol>

      <div className="space-y-2">
        {registrationSteps.map((item) => {
          const status: "done" | "current" | "pending" =
            item.step < currentStep
              ? "done"
              : item.step === currentStep
                ? "current"
                : "pending";
          const isOpen = openStep === item.step;

          return (
            <div
              key={item.step}
              className={cn(
                "rounded-lg border",
                status === "current" && "border-primary bg-primary/5",
                status === "done" && "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20",
                status === "pending" && "border-border"
              )}
            >
              <button
                type="button"
                className="flex w-full items-start gap-3 p-3 text-left"
                onClick={() => setOpenStep(isOpen ? null : item.step)}
                aria-expanded={isOpen}
              >
                <StepStatusIcon status={status} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      Step {item.step}: {item.title}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" aria-hidden="true" />
                      {formatEstimatedTime(item.estimatedMinutes)}
                    </span>
                  </div>
                  {!isOpen && (
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <div className="space-y-3 border-t px-3 pb-3 pt-2 text-sm">
                  <p className="text-muted-foreground">{item.description}</p>
                  <ul className="space-y-1.5">
                    {item.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2">
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

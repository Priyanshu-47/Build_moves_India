"use client";

import { useCallback, useRef } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type StepperStep = {
  id: string;
  label: string;
  shortLabel?: string;
};

type StepperProps = {
  steps: StepperStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete?: () => void;
};

function stepStatus(index: number, currentStep: number): "completed" | "current" | "upcoming" {
  if (index < currentStep) return "completed";
  if (index === currentStep) return "current";
  return "upcoming";
}

export function Stepper({ steps, currentStep, onStepChange, onComplete }: StepperProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const progress = steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 100;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLOListElement>) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        if (currentStep < steps.length - 1) {
          onStepChange(currentStep + 1);
        }
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        if (currentStep > 0) {
          onStepChange(currentStep - 1);
        }
      }
      if (event.key === "Enter" && currentStep === steps.length - 1) {
        onComplete?.();
      }
    },
    [currentStep, onComplete, onStepChange, steps.length]
  );

  return (
    <nav aria-label="Setup progress" className="space-y-3">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label={`Step ${currentStep + 1} of ${steps.length}`}
      >
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol
        ref={listRef}
        className="flex items-start justify-between gap-1"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {steps.map((step, index) => {
          const status = stepStatus(index, currentStep);
          const canNavigate = status === "completed";

          return (
            <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center">
              <button
                type="button"
                disabled={!canNavigate}
                onClick={() => canNavigate && onStepChange(index)}
                aria-current={status === "current" ? "step" : undefined}
                aria-label={`${step.label}${status === "completed" ? ", completed" : status === "current" ? ", current" : ""}`}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  status === "completed" &&
                    "border-green-600 bg-green-600 text-white hover:bg-green-700",
                  status === "current" && "border-primary bg-primary text-primary-foreground",
                  status === "upcoming" &&
                    "border-muted-foreground/30 bg-background text-muted-foreground",
                  canNavigate && "cursor-pointer",
                  !canNavigate && status !== "current" && "cursor-default"
                )}
              >
                {status === "completed" ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </button>
              <span
                className={cn(
                  "mt-1.5 hidden max-w-full truncate text-center text-xs font-medium sm:block",
                  status === "current" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  "mt-1.5 max-w-full truncate text-center text-[10px] font-medium sm:hidden",
                  status === "current" ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.shortLabel ?? step.label.split(" ")[0]}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

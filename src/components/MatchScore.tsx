"use client";

import { useState } from "react";

import { MatchDimensions } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type MatchScoreProps = {
  score: number;
  dimensions: MatchDimensions;
  className?: string;
};

const DIMENSION_LABELS: { key: keyof MatchDimensions; label: string }[] = [
  { key: "product", label: "Product" },
  { key: "location", label: "Location" },
  { key: "capacity", label: "Capacity" },
  { key: "eligibility", label: "Eligibility" },
  { key: "certifications", label: "Certifications" },
];

function scoreColor(score: number): string {
  if (score > 80) return "#16a34a";
  if (score >= 60) return "#ca8a04";
  return "#dc2626";
}

function scoreTextClass(score: number): string {
  if (score > 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function MatchScore({ score, dimensions, className }: MatchScoreProps) {
  const [open, setOpen] = useState(false);
  const stroke = scoreColor(score);
  const circumference = 2 * Math.PI * 15.9;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-expanded={open}
        aria-label={`Match score ${score} percent. Tap for breakdown.`}
      >
        <div className="relative size-16">
          <svg className="size-16 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-muted/40"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke={stroke}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center text-lg font-bold",
              scoreTextClass(score)
            )}
          >
            {score}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">Match</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-10 mt-2 w-48 rounded-lg border bg-popover p-3 text-popover-foreground shadow-md">
          <p className="mb-2 text-xs font-medium">Score breakdown</p>
          <ul className="space-y-1.5">
            {DIMENSION_LABELS.map(({ key, label }) => (
              <li key={key} className="flex items-center justify-between gap-2 text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{dimensions[key]}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

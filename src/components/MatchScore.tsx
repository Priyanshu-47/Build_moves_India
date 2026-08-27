"use client";

import { useRef, useState } from "react";

import { Modal } from "@/components/ui/modal";
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const stroke = scoreColor(score);
  const circumference = 2 * Math.PI * 15.9;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Match score ${score} percent. Open breakdown.`}
      >
        <div className="relative size-16" aria-hidden="true">
          <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Match score breakdown"
        triggerRef={triggerRef}
      >
        <p className="mb-3 text-sm text-muted-foreground" aria-live="polite">
          Overall match: <strong className="text-foreground">{score}/100</strong>
        </p>
        <ul className="space-y-2">
          {DIMENSION_LABELS.map(({ key, label }) => (
            <li key={key} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{dimensions[key]}%</span>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}

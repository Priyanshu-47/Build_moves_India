"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, XCircle } from "lucide-react";

import { ReadinessCheck } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const FIX_INSTRUCTIONS: Record<string, string> = {
  product_match:
    "Add matching products to your GeM catalogue or update your Sahayak profile with the correct product keywords.",
  certifications:
    "Upload missing certificates (BIS, ISO, Udyam) in the GeM seller dashboard under Document Management.",
  caution_money:
    "Pay the required caution money through the GeM seller dashboard before participating in bids.",
  bank_verified:
    "Complete bank account verification in your GeM seller profile with a cancelled cheque.",
  capacity:
    "Confirm you can meet the delivery schedule, or partner with another manufacturer to fulfil the quantity.",
  deadline:
    "Prioritise document preparation immediately. Consider bids with more time if the deadline is too tight.",
  emd:
    "Deposit earnest money (EMD) via GeM payment gateway before the bid submission deadline.",
};

type ReadinessChecklistProps = {
  checks: ReadinessCheck[];
  className?: string;
};

function StatusIcon({ status }: { status: ReadinessCheck["status"] }) {
  if (status === "pass") {
    return <CheckCircle2 className="size-5 shrink-0 text-green-600" aria-hidden="true" />;
  }
  if (status === "warn") {
    return <AlertTriangle className="size-5 shrink-0 text-yellow-600" aria-hidden="true" />;
  }
  return <XCircle className="size-5 shrink-0 text-red-600" aria-hidden="true" />;
}

function CheckItem({ check }: { check: ReadinessCheck }) {
  const [expanded, setExpanded] = useState(false);
  const fixInstruction = FIX_INSTRUCTIONS[check.id];
  const showFix = check.status === "fail" && fixInstruction;

  return (
    <li
      className={cn(
        "rounded-lg border p-4",
        check.status === "fail" && "border-red-200 bg-red-50",
        check.status === "warn" && "border-yellow-200 bg-yellow-50",
        check.status === "pass" && "border-border bg-card"
      )}
    >
      <div className="flex items-start gap-3">
        <StatusIcon status={check.status} />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium">{check.label}</p>
          {check.message && (
            <p
              className={cn(
                "text-sm",
                check.status === "fail" && "text-red-800",
                check.status === "warn" && "text-yellow-900",
                check.status === "pass" && "text-muted-foreground"
              )}
            >
              {check.message}
            </p>
          )}

          {showFix && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                className="flex items-center gap-1 text-sm font-medium text-red-700"
                aria-expanded={expanded}
              >
                How to fix
                <ChevronDown
                  className={cn("size-4 transition-transform", expanded && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
              {expanded && (
                <p className="mt-2 text-sm text-red-800">{fixInstruction}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function ReadinessChecklist({ checks, className }: ReadinessChecklistProps) {
  return (
    <ul className={cn("space-y-3", className)}>
      {checks.map((check) => (
        <CheckItem key={check.id} check={check} />
      ))}
    </ul>
  );
}

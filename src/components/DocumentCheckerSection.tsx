"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, XCircle } from "lucide-react";

import { CheckStatus } from "@/lib/schemas";
import {
  DocumentValidationInput,
  getRegistrationProgressStep,
  validateDocuments,
} from "@/lib/rules/registration";
import { cn } from "@/lib/utils";

import { RegistrationGuide } from "./RegistrationGuide";

const COMMON_REJECTIONS = [
  {
    title: "Name mismatch across documents",
    detail:
      "PAN, Aadhaar, GST, and bank account names must match exactly — even an extra initial causes rejection.",
  },
  {
    title: "Wrong business type at sign-up",
    detail:
      "Selecting 'service provider' when you are a manufacturer blocks furniture product listings.",
  },
  {
    title: "Inactive or joint bank account",
    detail:
      "Penny-drop verification fails on dormant accounts. Use the proprietor's primary current account.",
  },
  {
    title: "Invalid or unlinked mobile",
    detail:
      "Aadhaar OTP fails if the registered mobile number is outdated or not linked.",
  },
  {
    title: "Incomplete profile before submission",
    detail:
      "Skipping GSTIN or bank verification leaves profile below 100% — approval takes longer or stalls.",
  },
];

type DocumentCheckerProps = {
  seller: DocumentValidationInput;
  email: string;
  bankAccount: string;
  ifsc: string;
  onEmailChange: (value: string) => void;
  onBankAccountChange: (value: string) => void;
  onIfscChange: (value: string) => void;
};

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "pass") {
    return <CheckCircle2 className="size-4 shrink-0 text-green-600" aria-hidden="true" />;
  }
  if (status === "warn") {
    return <AlertTriangle className="size-4 shrink-0 text-yellow-600" aria-hidden="true" />;
  }
  return <XCircle className="size-4 shrink-0 text-red-600" aria-hidden="true" />;
}

export function DocumentCheckerSection({
  seller,
  email,
  bankAccount,
  ifsc,
  onEmailChange,
  onBankAccountChange,
  onIfscChange,
}: DocumentCheckerProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [rejectionsOpen, setRejectionsOpen] = useState(false);
  const guideId = "registration-guide-panel";
  const rejectionsId = "common-rejections-panel";

  const validation = useMemo(
    () =>
      validateDocuments({
        ...seller,
        email,
        bankAccount,
        ifsc,
      }),
    [seller, email, bankAccount, ifsc]
  );

  const currentStep = getRegistrationProgressStep(validation.score);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Document Checker</h2>
        <p className="text-sm text-muted-foreground">
          Validate your documents before GeM registration — score:{" "}
          <strong>{validation.score}%</strong>
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="doc-email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="doc-email"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="seller@business.in"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="doc-bank" className="text-sm font-medium">
            Bank account
          </label>
          <input
            id="doc-bank"
            value={bankAccount}
            onChange={(event) => onBankAccountChange(event.target.value)}
            placeholder="123456789012"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="doc-ifsc" className="text-sm font-medium">
            IFSC
          </label>
          <input
            id="doc-ifsc"
            value={ifsc}
            onChange={(event) => onIfscChange(event.target.value)}
            placeholder="SBIN0001234"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          />
        </div>
      </div>

      <ul className="space-y-2">
        {validation.checks.map((check) => (
          <li
            key={check.id}
            className={cn(
              "flex items-start gap-2 rounded-lg border p-3 text-sm",
              check.status === "pass" && "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30",
              check.status === "warn" && "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30",
              check.status === "fail" && "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
            )}
          >
            <StatusIcon status={check.status} />
            <div>
              <p className="font-medium">{check.label}</p>
              <p className="text-muted-foreground">{check.message}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-lg border">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 p-4 text-left font-medium"
          onClick={() => setGuideOpen((open) => !open)}
          aria-expanded={guideOpen}
          aria-controls={guideId}
        >
          Registration Guide (7 steps)
          <ChevronDown
            className={cn("size-4 transition-transform", guideOpen && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        {guideOpen && (
          <div id={guideId} className="border-t p-4 print-expand">
            <RegistrationGuide currentStep={currentStep} />
          </div>
        )}
      </div>

      <div className="rounded-lg border">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 p-4 text-left font-medium"
          onClick={() => setRejectionsOpen((open) => !open)}
          aria-expanded={rejectionsOpen}
          aria-controls={rejectionsId}
        >
          Common Rejection Reasons
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              rejectionsOpen && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>
        {rejectionsOpen && (
          <ul id={rejectionsId} className="space-y-3 border-t p-4 text-sm print-expand">
            {COMMON_REJECTIONS.map((item) => (
              <li key={item.title}>
                <p className="font-medium">{item.title}</p>
                <p className="text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

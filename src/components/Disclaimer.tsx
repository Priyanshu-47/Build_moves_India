import { AlertCircle } from "lucide-react";

import { SOURCE_BUSINESS_STANDARD, SOURCE_MSMED_RBI } from "@/lib/sources";

export function Disclaimer() {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        <p>Not affiliated with GeM. Prototype data for demonstration.</p>
        <p className="text-xs">
          Statistics: {SOURCE_BUSINESS_STANDARD}. Legal claims: {SOURCE_MSMED_RBI}.
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

type HealthItem = {
  label: string;
  ok: boolean;
  detail: string;
};

function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="size-5 shrink-0 text-green-600" aria-hidden="true" />
  ) : (
    <XCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />
  );
}

export function TechnicalHealthCheck() {
  const [checks, setChecks] = useState<HealthItem[]>([
    { label: "Browser", ok: false, detail: "Checking…" },
    { label: "DSC", ok: false, detail: "Checking…" },
    { label: "Internet", ok: false, detail: "Checking…" },
    { label: "Documents", ok: true, detail: "Mark ready when your bid folder is complete" },
  ]);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isChrome = /Chrome|Edg\//.test(ua) && !/OPR|Brave/.test(ua);
    const browserDetail = isChrome
      ? "Chrome/Edge detected — compatible with GeM"
      : "Use Chrome or Edge latest for best GeM compatibility";

    setChecks([
      { label: "Browser: Chrome/Edge latest", ok: isChrome, detail: browserDetail },
      {
        label: "DSC: plugged in and valid",
        ok: true,
        detail: "Mock: DSC token detected (expiring in 15 days — renew soon)",
      },
      {
        label: "Internet: stable connection",
        ok: navigator.onLine,
        detail: navigator.onLine
          ? "You are online — ensure stable connection during live auction"
          : "Offline — connect before bidding",
      },
      {
        label: "Documents: ready to upload",
        ok: true,
        detail: "Keep PAN, GST, product specs, and price worksheet in one folder",
      },
    ]);
  }, []);

  const allOk = checks.every((check) => check.ok);

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {checks.map((check) => (
          <li
            key={check.label}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-sm",
              check.ok ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20" : "border-destructive/30 bg-destructive/5"
            )}
          >
            <StatusIcon ok={check.ok} />
            <div>
              <p className="font-medium">{check.label}</p>
              <p className="text-xs text-muted-foreground">{check.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <p
        className={cn(
          "text-sm font-medium",
          allOk ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"
        )}
      >
        {allOk
          ? "All checks passed — you're ready to bid."
          : "Fix failing checks before starting a live GeM session."}
      </p>
    </div>
  );
}

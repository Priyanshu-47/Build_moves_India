"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Printer,
  RotateCcw,
  Upload,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { SellerProfileSchema } from "@/lib/schemas";
import { clearSeller, getSeller } from "@/lib/store";
import { logout } from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    const seller = getSeller();
    if (!seller) {
      setError("No profile found to export.");
      return;
    }
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: seller,
      bidHistory: JSON.parse(localStorage.getItem("sahayak-bid-history") ?? "[]"),
      payments: JSON.parse(localStorage.getItem("sahayak-payments") ?? "[]"),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sahayak-profile-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Profile exported successfully.");
    setError(null);
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        const profile = SellerProfileSchema.parse(data.profile ?? data);
        localStorage.setItem("sahayak-seller", JSON.stringify(profile));
        if (data.bidHistory) localStorage.setItem("sahayak-bid-history", JSON.stringify(data.bidHistory));
        if (data.payments) localStorage.setItem("sahayak-payments", JSON.stringify(data.payments));
        setMessage("Profile imported successfully. Refreshing…");
        setError(null);
        setTimeout(() => router.refresh(), 1000);
      } catch {
        setError("Invalid profile file. Please upload a valid Sahayak JSON export.");
        setMessage(null);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }

  function handleReset() {
    if (!window.confirm("This will clear all your data and return to login. Continue?")) return;
    localStorage.clear();
    clearSeller();
    logout();
    window.location.replace("/welcome");
  }

  function handlePrint() {
    document.body.setAttribute("data-print-date", new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }));
    window.print();
  }

  return (
    <PageShell className="space-y-5">
      {/* Header */}
      <div>
        <button type="button" onClick={() => router.back()} className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition">
          <ArrowLeft className="size-3" /> Back to profile
        </button>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Export, import, or reset your Sahayak profile data.</p>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Action cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleExport}
          className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition hover:bg-muted/30"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
            <Download className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Export Profile</p>
            <p className="text-xs text-muted-foreground">Download seller profile, bid history, and payments as JSON</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition hover:bg-muted/30"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <Upload className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Import Profile</p>
            <p className="text-xs text-muted-foreground">Upload a previously exported JSON file to restore data</p>
          </div>
        </button>
        <input ref={fileInputRef} type="file" accept=".json,application/json" className="sr-only" onChange={handleImport} aria-label="Import profile JSON file" />

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-start gap-3 rounded-xl border bg-card p-4 text-left transition hover:bg-muted/30"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
            <Printer className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Print Report</p>
            <p className="text-xs text-muted-foreground">Generate a print-friendly report of your profile</p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4 text-left transition hover:bg-red-50 dark:border-red-800 dark:bg-red-950/20 dark:hover:bg-red-950/40"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <RotateCcw className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Reset Demo</p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">Clear all localStorage data and return to login</p>
          </div>
        </button>
      </div>
    </PageShell>
  );
}

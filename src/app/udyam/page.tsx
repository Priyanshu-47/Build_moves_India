"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  ExternalLink,
  FileCheck2,
  IndianRupee,
  Info,
  Shield,
  Timer,
  TrendingUp,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { UdyamQualificationCheck } from "@/components/UdyamQualificationCheck";

const UDYAM_PORTAL_URL = "https://udyamregistration.gov.in/";

const BENEFITS = [
  {
    title: "EMD exemption",
    description: "Save 5%–15% of bid value — no earnest money deposit for registered MSEs.",
    icon: IndianRupee,
    tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    href: "/msme-rights#emd-exemption",
  },
  {
    title: "25% procurement reservation",
    description: "Government buyers must procure 25% from MSEs on GeM.",
    icon: Shield,
    tint: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
    href: "/msme-rights#price-preference",
  },
  {
    title: "Price preference (L1+15%)",
    description: "If your quote is within 15% of L1, you can match and win on MSE preference.",
    icon: TrendingUp,
    tint: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400",
    href: "/msme-rights#price-preference",
  },
] as const;

const STEPS = [
  'Visit udyamregistration.gov.in and click "For New Entrepreneurs who are not registered yet as MSME".',
  "Enter your Aadhaar number and verify with OTP.",
  "Fill in your business details, investment & turnover.",
  "Review and submit. Your Udyam Certificate will be generated instantly.",
] as const;

const MISTAKES = [
  "Wrong turnover figures — mismatched with GST returns can flag your registration.",
  "Not linking Udyam to GeM — benefits like EMD exemption won't apply until linked.",
  "Name mismatch across Aadhaar, PAN, and bank — same issue that blocks GeM KYC.",
  "Selecting wrong NIC code — affects category eligibility on tenders.",
] as const;

export default function UdyamPage() {
  return (
    <PageShell className="pb-10">
      <Link
        href="/msme-rights"
        className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="size-3" aria-hidden="true" />
        Back to legal notice guide
      </Link>

      <header className="mt-4 space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Udyam Registration
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Register on Udyam FIRST — unlock{" "}
          <span className="font-semibold text-primary">₹5L+</span> in MSE benefits. Udyam is
          mandatory to claim MSE benefits on GeM.
        </p>
      </header>

      {/* Benefit cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {BENEFITS.map(({ title, description, icon: Icon, tint, href }) => (
          <Link
            key={title}
            href={href}
            className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary/25 hover:shadow-md"
          >
            <div
              className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-muted/60"
              aria-hidden="true"
            />
            <div
              className={`relative mb-4 flex size-11 items-center justify-center rounded-xl ${tint}`}
            >
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <p className="relative text-sm font-bold text-foreground">{title}</p>
            <p className="relative mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
            <span className="relative mt-4 inline-flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      {/* What is Udyam */}
      <section className="relative mt-5 overflow-hidden rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="relative z-[1] max-w-3xl">
          <div className="mb-3 flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
              <Info className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">What is Udyam?</p>
              <p className="text-xs text-muted-foreground">
                Mandatory MSME registration for GeM benefits
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Udyam Registration (formerly Udyog Aadhaar) is the official MSME certificate issued by
            the Ministry of MSME. Without it, you are treated as a non-MSE seller on GeM — meaning
            you pay EMD on every bid and miss 25% reserved procurement categories.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sahayak recommends{" "}
            <strong className="text-primary">completing Udyam before your first GeM bid</strong> —
            it is the single highest-ROI step for new sellers.
          </p>
        </div>
        <div
          className="pointer-events-none absolute bottom-2 right-4 hidden opacity-80 sm:block"
          aria-hidden="true"
        >
          <div className="relative">
            <FileCheck2 className="size-20 text-sky-200 dark:text-sky-900" />
            <Building2 className="absolute -bottom-1 -left-3 size-10 text-indigo-200 dark:text-indigo-900" />
            <BadgeCheck className="absolute -right-1 top-0 size-6 text-emerald-400" />
          </div>
        </div>
      </section>

      {/* Qualification */}
      <section className="mt-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-1 flex items-center gap-2">
          <Building2 className="size-4 text-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-foreground">Qualification check</h2>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Investment in plant &amp; machinery (excluding land &amp; building)
        </p>
        <UdyamQualificationCheck />
      </section>

      {/* Steps */}
      <section className="relative mt-5 overflow-hidden rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="relative z-[1] max-w-3xl">
          <div className="mb-4 flex items-center gap-2">
            <Timer className="size-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-bold text-foreground">
              Registration steps (~15 minutes, free)
            </h2>
          </div>
          <ol className="space-y-3">
            {STEPS.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed text-foreground">{step}</span>
              </li>
            ))}
          </ol>

          <a
            href={UDYAM_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Start Udyam registration
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div
          className="pointer-events-none absolute bottom-4 right-6 hidden opacity-70 lg:block"
          aria-hidden="true"
        >
          <Timer className="size-24 text-indigo-200 dark:text-indigo-900" />
        </div>
      </section>

      {/* Mistakes */}
      <section className="mt-5 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
            <AlertTriangle className="size-4" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-bold text-foreground">Common mistakes to avoid</h2>
        </div>
        <ul className="space-y-2">
          {MISTAKES.map((mistake) => (
            <li
              key={mistake}
              className="flex items-start gap-2.5 rounded-xl bg-rose-50/70 px-3.5 py-2.5 text-sm text-rose-800 dark:bg-rose-950/25 dark:text-rose-200"
            >
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-500"
                aria-hidden="true"
              />
              {mistake}
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}

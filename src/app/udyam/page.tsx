import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  ExternalLink,
  IndianRupee,
  Shield,
  TrendingUp,
} from "lucide-react";

import { Disclaimer } from "@/components/Disclaimer";
import { PageShell } from "@/components/PageShell";
import { UdyamQualificationCheck } from "@/components/UdyamQualificationCheck";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BENEFITS = [
  {
    title: "EMD exemption",
    description: "Saves ₹5K–50K per bid — no earnest money deposit for registered MSEs.",
    icon: IndianRupee,
  },
  {
    title: "25% procurement reservation",
    description: "Government buyers must procure 25% from MSEs on GeM.",
    icon: Shield,
  },
  {
    title: "Price preference (L1+15%)",
    description: "If your quote is within 15% of L1, you can match and win on MSE preference.",
    icon: TrendingUp,
  },
] as const;

const STEPS = [
  "Visit udyamregistration.gov.in and click \"For New Entrepreneurs who are not registered yet as MSME\".",
  "Enter your Aadhaar number and verify with OTP.",
  "Validate PAN — name must match Aadhaar exactly.",
  "Fill business details: type, address, bank account, investment & turnover (in ₹ lakhs/crore).",
  "Select NIC code for your primary business activity.",
  "Review and submit — Udyam certificate is generated instantly (free, no fees).",
  "Download certificate and link your Udyam Registration Number (URN) on your GeM seller profile.",
] as const;

const MISTAKES = [
  "Wrong turnover figures — mismatched with GST returns can flag your registration.",
  "Not linking Udyam to GeM — benefits like EMD exemption won't apply until linked.",
  "Name mismatch across Aadhaar, PAN, and bank — same issue that blocks GeM KYC.",
  "Selecting wrong NIC code — affects category eligibility on tenders.",
] as const;

const UDYAM_PORTAL_URL = "https://udyamregistration.gov.in/";

export default function UdyamPage() {
  return (
    <PageShell className="space-y-8">
      <section className="space-y-3 text-center sm:text-left">
        <p className="text-sm font-medium text-primary">Udyam Registration</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Register on Udyam FIRST — unlock ₹5L+ in MSE benefits
        </h1>
        <p className="text-muted-foreground">
          Udyam is mandatory to claim MSE benefits on GeM — EMD exemption, procurement
          reservation, and price preference. Registration is free and takes ~15 minutes.
        </p>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BadgeCheck className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>What is Udyam?</CardTitle>
          </div>
          <CardDescription>
            Mandatory MSME registration for Government e-Marketplace benefits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Udyam Registration (formerly Udyog Aadhaar) is the official MSME certificate
            issued by the Ministry of MSME. Without it, you are treated as a non-MSE seller
            on GeM — meaning you pay EMD on every bid and miss 25% reserved procurement
            categories.
          </p>
          <p>
            Sahayak recommends completing Udyam <strong className="text-foreground">before</strong>{" "}
            your first GeM bid — it is the single highest-ROI step for new sellers.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Qualification check</CardTitle>
          <CardDescription>
            Investment in plant & machinery (excluding land & building)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UdyamQualificationCheck />
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        {BENEFITS.map(({ title, description, icon: Icon }) => (
          <Card key={title} size="sm">
            <CardHeader>
              <Icon className="mb-1 size-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step-by-step walkthrough</CardTitle>
          <CardDescription>udyamregistration.gov.in — free, paperless, instant</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" aria-hidden="true" />
            <CardTitle>Common mistakes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {MISTAKES.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ArrowRight
                  className="mt-0.5 size-4 shrink-0 text-amber-600"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <a
        href={UDYAM_PORTAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 sm:w-auto"
      >
        Go to Udyam Portal
        <ExternalLink className="size-4" aria-hidden="true" />
      </a>

      <Disclaimer />
      <p className="text-xs text-muted-foreground">
        Udyam thresholds and GeM MSE policies are based on public guidelines. Verify current
        rules on official portals before registering.
      </p>

      <Link
        href="/setup"
        className="inline-flex text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        ← Back to seller setup
      </Link>
    </PageShell>
  );
}

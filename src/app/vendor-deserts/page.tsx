import Link from "next/link";

import { Disclaimer } from "@/components/Disclaimer";
import { SOURCE_BUSINESS_STANDARD, SOURCE_MSMED_RBI } from "@/lib/sources";
import { PageShell } from "@/components/PageShell";
import { VendorDesertDashboard } from "@/components/VendorDesertDashboard";

export default function VendorDesertsPage() {
  return (
    <PageShell className="space-y-6">
      <section className="space-y-3">
        <p className="text-sm font-medium text-primary">Regional Vendor Desert Heatmap</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Vendor Deserts — where you&apos;re needed most
        </h1>
        <p className="text-muted-foreground">
          GeM sellers cluster in 10 states while Northeast, Jammu & Kashmir, and Ladakh face
          vendor shortages. See where your products are needed — and how to expand profitably.
        </p>
      </section>

      <VendorDesertDashboard />

      <Link
        href="/opportunities"
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 sm:w-auto"
      >
        Find opportunities in remote regions
      </Link>

      <Disclaimer />
      <p className="text-xs text-muted-foreground">
        Scarcity data is simulated based on GeM public procurement patterns.{" "}
        {SOURCE_BUSINESS_STANDARD}. Legal claims: {SOURCE_MSMED_RBI}.
      </p>
    </PageShell>
  );
}

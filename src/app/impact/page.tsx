import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  ClipboardList,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";

import { Disclaimer } from "@/components/Disclaimer";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { SOURCE_BUSINESS_STANDARD, SOURCE_MSMED_RBI } from "@/lib/sources";

const STATS = [
  {
    text: "60-70 Lakh+ sellers registered, only 11 Lakh+ MSE sellers executing orders",
    source: SOURCE_BUSINESS_STANDARD,
  },
  {
    text: "Millions of registered sellers struggle to complete their first order",
    source: SOURCE_BUSINESS_STANDARD,
  },
  {
    text: "MSEs execute 68% of all GeM orders",
    source: SOURCE_BUSINESS_STANDARD,
  },
  {
    text: "Average MSE earns ₹2-5L per order",
    source: SOURCE_BUSINESS_STANDARD,
  },
] as const;

const RAMESH_JOURNEY = [
  "Month 1: Registered, listed 4 products, won 0 bids",
  "Month 2: Used Sahayak, fixed catalogue, won 2 bids worth ₹4.2L",
  "Month 3: Won 3 more bids, revenue ₹8.4L, hired 2 employees",
  "Revenue growth: 340% in 6 months",
] as const;

const PROJECTED_IMPACT = [
  "If Sahayak helps 1 lakh stuck sellers complete even 1 order = ₹200-500 Cr additional economic activity",
  "Each order supports 1-3 jobs (manufacturing, logistics, packaging)",
  "Estimated 2-3 Lakh new jobs if Sahayak scales",
] as const;

export default function ImpactPage() {
  return (
    <PageShell className="space-y-8">
      <PageHeader
        title="Impact"
        backUrl="/"
        subtitle="Government e-Marketplace is India's largest public procurement platform — but millions of sellers never complete their first order."
      />

      <p className="-mt-4 text-xs text-muted-foreground">{SOURCE_BUSINESS_STANDARD}</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {STATS.map(({ text, source }) => (
          <Card key={text} size="sm">
            <CardHeader>
              <CardDescription className="text-sm leading-relaxed text-foreground">
                {text}
              </CardDescription>
              <p className="text-[10px] text-muted-foreground sm:text-xs">{source}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Ramesh&apos;s journey (mock)</CardTitle>
          </div>
          <CardDescription>
            Ramesh Furniture Works, Jaipur — a typical stuck MSE seller
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {RAMESH_JOURNEY.map((item, index) => (
              <li key={item} className="flex gap-3 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <span className="pt-0.5">{item}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Projected impact</CardTitle>
          </div>
          <CardDescription>If Sahayak scales nationally</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm">
            {PROJECTED_IMPACT.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <Search className="mb-1 size-5 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-base">Find tenders</CardTitle>
            <CardDescription>Match scoring surfaces what&apos;s worth pursuing</CardDescription>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <ClipboardList className="mb-1 size-5 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-base">Fix blockers</CardTitle>
            <CardDescription>Catalogue + readiness checks reduce rejections</CardDescription>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <Briefcase className="mb-1 size-5 text-muted-foreground" aria-hidden="true" />
            <CardTitle className="text-base">Win orders</CardTitle>
            <CardDescription>From stuck seller to active GeM supplier</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Link
        href="/setup"
        className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80"
      >
        Start with Sahayak
      </Link>

      <Disclaimer />
      <p className="text-xs text-muted-foreground">
        {SOURCE_BUSINESS_STANDARD}. Legal claims: {SOURCE_MSMED_RBI}.
      </p>
    </PageShell>
  );
}

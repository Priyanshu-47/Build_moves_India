import Link from "next/link";
import { ClipboardCheck, Search, Sparkles } from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: Search,
    title: "Discover",
    description:
      "See which government tenders match your products, location, and capacity.",
  },
  {
    icon: Sparkles,
    title: "Understand",
    description:
      "Get plain-language explanations of bid requirements and eligibility rules.",
  },
  {
    icon: ClipboardCheck,
    title: "Prepare",
    description:
      "Fix blockers, price confidently, and walk through a final bid checklist.",
  },
] as const;

export default function HomePage() {
  return (
    <PageShell className="flex flex-col sm:py-12">
      <section className="flex flex-1 flex-col gap-8">
        <div className="space-y-4 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Sahayak — Your GeM Seller Co-Pilot
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg">
            Find the right government tenders, understand requirements, prepare
            your bid
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} size="sm">
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>

        <div className="flex justify-center sm:justify-start">
          <Link
            href="/setup"
            className={buttonVariants({ size: "lg", className: "h-11 px-6" })}
          >
            Get Started
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

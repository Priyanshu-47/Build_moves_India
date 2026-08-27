"use client";

import { useParams } from "next/navigation";

import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const MODULE_CONTENT: Record<string, { title: string; description: string }> = {
  "gem-basics": {
    title: "GeM registration basics",
    description:
      "How to register as a seller, complete KYC, and list your first product on Government e-Marketplace.",
  },
  bidding: {
    title: "Bidding fundamentals",
    description:
      "Understanding L1, reverse auction, EMD, and how to price bids without destroying your margin.",
  },
  compliance: {
    title: "Compliance essentials",
    description:
      "GST, HSN codes, BIS certification, and catalogue golden parameters that cause rejections.",
  },
};

export default function LearnModulePage() {
  const params = useParams();
  const moduleId = String(params.moduleId ?? "");
  const module = MODULE_CONTENT[moduleId];

  return (
    <PageShell className="space-y-6">
      <PageHeader
        title="Module"
        backUrl="/learn"
        subtitle={module?.title ?? moduleId.replace(/-/g, " ")}
      />

      <Card>
        <CardHeader>
          <CardTitle>{module?.title ?? "Learning module"}</CardTitle>
          <CardDescription>
            {module?.description ??
              "This module is coming soon. Return to GeM Basics for personalised insights from your bid history."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Module ID: <span className="font-mono text-foreground">{moduleId}</span>
        </CardContent>
      </Card>
    </PageShell>
  );
}

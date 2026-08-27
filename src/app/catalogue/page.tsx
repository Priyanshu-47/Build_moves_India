"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CatalogueBuilder } from "@/components/CatalogueBuilder";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import { SellerProfile } from "@/lib/schemas";
import { getSeller } from "@/lib/store";

export default function CataloguePage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const profile = getSeller();
    if (!profile) {
      router.replace("/setup");
      return;
    }
    setSeller(profile);
    setReady(true);
  }, [router]);

  if (!ready || !seller) {
    return (
      <PageShell>
        <CardSkeleton rows={6} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Product Catalogue"
        backUrl="/"
        subtitle="Build a GeM-compliant product listing — 33% of first submissions are rejected."
      />

      {seller.products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products listed"
          description="No products listed. Add your first product to start bidding."
          actions={[
            { label: "Add product below", action: "#catalogue-form" },
            { label: "Browse opportunities", action: "/opportunities", variant: "outline" },
          ]}
        />
      ) : (
        <section className="mb-8 space-y-3">
          <h2 className="text-lg font-semibold">Your products</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {seller.products.map((product) => (
              <Card key={product} size="sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{product}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Listed on GeM</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div id="catalogue-form">
        <CatalogueBuilder seller={seller} />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        This generates draft data. Final submission happens on gem.gov.in
      </p>
    </PageShell>
  );
}

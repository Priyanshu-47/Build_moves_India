"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { CatalogueBuilder } from "@/components/CatalogueBuilder";
import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";
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
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Catalogue Builder</h1>
        <p className="text-sm text-muted-foreground">
          Build a GeM-compliant product listing — 33% of first submissions are rejected.
        </p>
      </div>

      <CatalogueBuilder seller={seller} />

      <p className="mt-6 text-xs text-muted-foreground">
        This generates draft data. Final submission happens on gem.gov.in
      </p>
    </PageShell>
  );
}

"use client";

import { useEffect, useState } from "react";

import { HomeDashboard } from "@/components/HomeDashboard";
import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";
import { getCurrentUser } from "@/lib/auth";
import { SellerProfile } from "@/lib/schemas";

export default function HomePage() {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSeller(getCurrentUser());
    setReady(true);
  }, []);

  if (!ready || !seller) {
    return (
      <PageShell>
        <CardSkeleton rows={6} />
      </PageShell>
    );
  }

  return <HomeDashboard seller={seller} />;
}

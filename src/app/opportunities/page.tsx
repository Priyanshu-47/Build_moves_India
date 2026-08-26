import { Suspense } from "react";

import { PageShell } from "@/components/PageShell";
import { OpportunitiesSkeleton, PageHeaderSkeleton } from "@/components/skeletons";

import { OpportunitiesContent } from "./OpportunitiesContent";

export default function OpportunitiesPage() {
  return (
    <Suspense
      fallback={
        <PageShell>
          <PageHeaderSkeleton />
          <OpportunitiesSkeleton />
        </PageShell>
      }
    >
      <OpportunitiesContent />
    </Suspense>
  );
}

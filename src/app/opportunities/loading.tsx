import { PageShell } from "@/components/PageShell";
import { OpportunitiesSkeleton, PageHeaderSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <PageShell>
      <PageHeaderSkeleton />
      <OpportunitiesSkeleton />
    </PageShell>
  );
}

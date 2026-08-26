import { PageShell } from "@/components/PageShell";
import { BidDetailSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <PageShell>
      <BidDetailSkeleton />
    </PageShell>
  );
}

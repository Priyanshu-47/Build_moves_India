import { PageShell } from "@/components/PageShell";
import { LandingSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <PageShell>
      <LandingSkeleton />
    </PageShell>
  );
}

import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <PageShell>
      <CardSkeleton rows={8} />
    </PageShell>
  );
}

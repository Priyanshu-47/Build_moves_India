import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <PageShell>
      <CardSkeleton rows={6} />
      <div className="mt-4">
        <CardSkeleton rows={4} />
      </div>
    </PageShell>
  );
}

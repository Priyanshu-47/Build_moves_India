import { PageShell } from "@/components/PageShell";
import { CardSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <PageShell>
      <CardSkeleton rows={3} />
      <div className="mt-4 space-y-4">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={5} />
      </div>
    </PageShell>
  );
}

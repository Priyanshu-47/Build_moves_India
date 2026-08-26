import { PageShell } from "@/components/PageShell";
import { FormSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <PageShell>
      <FormSkeleton />
    </PageShell>
  );
}

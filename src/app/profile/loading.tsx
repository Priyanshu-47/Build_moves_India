import { PageShell } from "@/components/PageShell";
import { ProfileSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <PageShell>
      <ProfileSkeleton />
    </PageShell>
  );
}

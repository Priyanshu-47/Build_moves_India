"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Sign-in route disabled — demo accounts on /welcome cover authentication. */
export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/welcome");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
      <div className="space-y-3 text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Redirecting to demo…</p>
      </div>
    </div>
  );
}

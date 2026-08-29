"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { isLoggedIn } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/welcome", "/onboarding", "/how-it-works"];

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  useEffect(() => {
    // Sign-in route disabled — demo accounts cover auth
    if (pathname === "/login" || pathname.startsWith("/login/")) {
      setReady(false);
      router.replace("/welcome");
      return;
    }

    const loggedIn = isLoggedIn();

    if (!loggedIn && !isPublic) {
      setReady(false);
      router.replace("/welcome");
      return;
    }

    if (loggedIn && (pathname === "/welcome" || pathname === "/onboarding")) {
      setReady(false);
      router.replace("/");
      return;
    }

    setReady(true);
  }, [pathname, isPublic, router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-24" role="status" aria-live="polite">
        <div className="space-y-3 text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

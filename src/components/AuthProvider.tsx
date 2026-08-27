"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { isLoggedIn } from "@/lib/auth";

const PUBLIC_PATHS = ["/login"];

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
    const loggedIn = isLoggedIn();

    if (!loggedIn && !isPublic) {
      router.replace("/login");
      return;
    }

    if (loggedIn && pathname === "/login") {
      router.replace("/");
      return;
    }

    setReady(true);
  }, [pathname, isPublic, router]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthProvider } from "@/components/AuthProvider";
import { Disclaimer } from "@/components/Disclaimer";
import { KeyboardBackShortcut } from "@/components/KeyboardBackShortcut";
import { LogoutButton } from "@/components/LogoutButton";
import { MobileNav } from "@/components/MobileNav";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";

const PUBLIC_PATHS = ["/login"];

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  return (
    <AuthProvider>
      <KeyboardBackShortcut />
      {!isPublic && (
        <header className="no-print sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="app-container flex h-14 items-center justify-between">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Sahayak
            </Link>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <LogoutButton />
              <ThemeToggle />
            </div>
          </div>
        </header>
      )}

      {!isPublic && <MobileNav />}

      <div className={`flex flex-1 flex-col ${isPublic ? "" : "pb-28 lg:pb-0"}`}>
        {children}
        {!isPublic && (
          <footer className="no-print mt-auto w-full py-4 md:py-6">
            <div className="app-container">
              <Disclaimer />
            </div>
          </footer>
        )}
      </div>
    </AuthProvider>
  );
}

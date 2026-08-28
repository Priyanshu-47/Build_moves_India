"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthProvider } from "@/components/AuthProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { Disclaimer } from "@/components/Disclaimer";
import { KeyboardBackShortcut } from "@/components/KeyboardBackShortcut";
import { LogoutButton } from "@/components/LogoutButton";
import { MobileNav } from "@/components/MobileNav";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";

const PUBLIC_PATHS = ["/login", "/welcome", "/onboarding"];

type AppShellProps = {
  children: React.ReactNode;
};

function SahayakMark({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 32 32" className="size-8" fill="none">
        <rect width="32" height="32" rx="8" fill="#1E3A5F" />
        <path
          d="M8 22V10h4.2c2.4 0 3.9 1.2 3.9 3.1 0 1.3-.7 2.3-1.9 2.8L18 22h-3.2l-3.2-5.4H11V22H8zm3-8.2h1.1c.9 0 1.5-.5 1.5-1.2S13 11.4 12.1 11.4H11v2.4z"
          fill="white"
        />
        <circle cx="23" cy="11" r="2.2" fill="#60a5fa" />
      </svg>
    </span>
  );
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (isPublic) {
    return (
      <AuthProvider>
        <div className="flex min-h-screen flex-col">{children}</div>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <KeyboardBackShortcut />
      <div className="flex min-h-screen">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col lg:pl-[260px] transition-all duration-300">
          {/* Mobile top bar only */}
          <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-primary/10 bg-background/90 px-4 backdrop-blur-md lg:hidden">
            <Link href="/" className="flex items-center gap-2" aria-label="Sahayak home">
              <SahayakMark />
              <span className="font-bold">Sahayak</span>
            </Link>
            <div className="flex items-center gap-1">
              <NotificationBell />
              <LogoutButton />
              <ThemeToggle />
            </div>
          </header>

          {/* Desktop top actions */}
          <header className="no-print sticky top-0 z-30 hidden h-14 items-center justify-end gap-1 border-b border-primary/10 bg-background/80 px-8 backdrop-blur-md lg:flex">
            <NotificationBell />
            <LogoutButton />
            <ThemeToggle />
          </header>

          <div className="flex flex-1 flex-col pb-28 lg:pb-0">
            {children}
            <footer className="no-print mt-auto border-t border-primary/5 px-6 py-4 lg:px-10">
              <Disclaimer />
            </footer>
          </div>

          <MobileNav />
        </div>
      </div>
    </AuthProvider>
  );
}

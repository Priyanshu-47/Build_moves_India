"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DESKTOP_NAV_ITEMS, isNavActive } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

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

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="no-print fixed inset-y-0 left-0 z-40 hidden w-[260px] flex-col border-r border-primary/10 bg-card/80 backdrop-blur-xl lg:flex"
      aria-label="Sidebar navigation"
    >
      <div className="flex h-16 items-center gap-3 border-b border-primary/10 px-5">
        <Link href="/" className="flex items-center gap-3">
          <SahayakMark />
          <div className="leading-tight">
            <p className="font-bold tracking-tight">Sahayak</p>
            <p className="text-[10px] font-medium text-muted-foreground">GeM Co-Pilot</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {DESKTOP_NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isNavActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-primary/10 p-4">
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/5 p-4">
          <p className="text-xs font-semibold text-primary">Need help?</p>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Explore the onboarding walkthrough or visit Impact to see what Sahayak can do.
          </p>
          <Link
            href="/onboarding"
            className="mt-3 inline-block text-xs font-semibold text-primary underline-offset-2 hover:underline"
          >
            How Sahayak works →
          </Link>
        </div>
      </div>
    </aside>
  );
}

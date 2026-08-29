"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { DESKTOP_NAV_ITEMS, isNavActive } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

/* GeM-inspired logo — government procurement shield with "S" */
function SahayakLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <span className="shrink-0" aria-hidden="true">
      <svg viewBox="0 0 36 36" className={cn("transition-all", collapsed ? "size-9" : "size-8")}>
        {/* Shield shape */}
        <path
          d="M18 2L4 8v10c0 9.4 6 18.2 14 20 8-1.8 14-10.6 14-20V8L18 2z"
          fill="#1E3A5F"
        />
        {/* Inner shield accent */}
        <path
          d="M18 5L7 9.5v8.5c0 7.8 4.7 15 11 16.5 6.3-1.5 11-8.7 11-16.5V9.5L18 5z"
          fill="#2563EB"
          opacity="0.15"
        />
        {/* "S" for Sahayak */}
        <text x="18" y="23" textAnchor="middle" fill="white" fontSize="16" fontWeight="800" fontFamily="system-ui">S</text>
        {/* GeM dot accent */}
        <circle cx="28" cy="8" r="3" fill="#60a5fa" />
      </svg>
    </span>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "no-print fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-primary/10 bg-card/80 backdrop-blur-xl transition-all duration-300 lg:flex",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
      aria-label="Sidebar navigation"
    >
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-primary/10 px-4">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <SahayakLogo collapsed={collapsed} />
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="font-bold tracking-tight">Sahayak</p>
              <p className="text-[10px] font-medium text-muted-foreground">GeM Co-Pilot</p>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {DESKTOP_NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isNavActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
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
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Footer help */}
      {!collapsed && (
        <div className="border-t border-primary/10 p-4">
          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/5 p-4">
            <p className="text-xs font-semibold text-primary">Need help?</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Read the full Sahayak brief — pain points, features, and economic impact.
            </p>
            <Link
              href="/how-it-works"
              className="mt-3 inline-block text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              How Sahayak works →
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}

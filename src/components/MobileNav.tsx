"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Home, Wrench } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/setup", label: "Setup", icon: Wrench, exact: false },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase, exact: false },
] as const;

function isActive(
  pathname: string,
  href: string,
  exact: boolean
): boolean {
  if (href === "/opportunities") {
    return pathname === href || pathname.startsWith("/opportunities/");
  }
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-16 min-w-0 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

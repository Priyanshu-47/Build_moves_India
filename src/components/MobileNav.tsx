"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  DESKTOP_NAV_ITEMS,
  MOBILE_NAV_ITEMS,
  isNavActive,
} from "@/lib/nav-items";
import { cn } from "@/lib/utils";

function getActiveIndex(
  pathname: string,
  items: readonly { href: string; exact: boolean }[]
): number {
  const index = items.findIndex((item) => isNavActive(pathname, item.href, item.exact));
  return index === -1 ? 0 : index;
}

function useRovingTabIndex(itemCount: number, pathname: string, items: readonly { href: string; exact: boolean }[]) {
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(() => getActiveIndex(pathname, items));

  useEffect(() => {
    setFocusedIndex(getActiveIndex(pathname, items));
  }, [pathname, items]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    let next = focusedIndex;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        next = (focusedIndex + 1) % itemCount;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        next = (focusedIndex - 1 + itemCount) % itemCount;
        break;
      case "Home":
        event.preventDefault();
        next = 0;
        break;
      case "End":
        event.preventDefault();
        next = itemCount - 1;
        break;
      default:
        return;
    }
    setFocusedIndex(next);
    itemRefs.current[next]?.focus();
  }

  return { itemRefs, focusedIndex, setFocusedIndex, handleKeyDown };
}

function MobileBottomNav() {
  const pathname = usePathname();
  const { itemRefs, focusedIndex, setFocusedIndex, handleKeyDown } = useRovingTabIndex(
    MOBILE_NAV_ITEMS.length,
    pathname,
    MOBILE_NAV_ITEMS
  );

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="no-print fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
      onKeyDown={handleKeyDown}
    >
      <div className="app-container grid h-16 grid-cols-5">
        {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon, exact }, index) => {
          const active = isNavActive(pathname, href, exact);
          return (
            <Link
              key={href}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              href={href}
              tabIndex={index === focusedIndex ? 0 : -1}
              aria-current={active ? "page" : undefined}
              onFocus={() => setFocusedIndex(index)}
              onKeyDown={(event) => {
                if (event.key === " " || event.key === "Spacebar") {
                  event.preventDefault();
                  event.currentTarget.click();
                }
              }}
              className={cn(
                "flex min-h-16 min-w-0 flex-col items-center justify-center gap-0.5 px-0.5 py-2 text-[10px] font-medium transition-colors sm:text-xs",
                active
                  ? "font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn("size-5 shrink-0", active && "fill-primary/15 stroke-[2.5]")}
                aria-hidden="true"
              />
              <span className="max-w-full truncate leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function DesktopTopNav() {
  const pathname = usePathname();
  const { itemRefs, focusedIndex, setFocusedIndex, handleKeyDown } = useRovingTabIndex(
    DESKTOP_NAV_ITEMS.length,
    pathname,
    DESKTOP_NAV_ITEMS
  );

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="no-print sticky top-14 z-40 hidden w-full border-b bg-background shadow-sm lg:block"
      onKeyDown={handleKeyDown}
    >
      <div className="app-container flex items-center gap-1 overflow-x-auto">
        {DESKTOP_NAV_ITEMS.map(({ href, label, icon: Icon, exact }, index) => {
          const active = isNavActive(pathname, href, exact);
          return (
            <Link
              key={href}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              href={href}
              tabIndex={index === focusedIndex ? 0 : -1}
              aria-current={active ? "page" : undefined}
              onFocus={() => setFocusedIndex(index)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-6 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon
                className={cn("size-4", active && "fill-primary/15 stroke-[2.5]")}
                aria-hidden="true"
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileNav() {
  return (
    <>
      <DesktopTopNav />
      <MobileBottomNav />
    </>
  );
}

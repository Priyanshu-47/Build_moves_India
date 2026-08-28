"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { MOBILE_NAV_ITEMS, isNavActive } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

function getActiveIndex(
  pathname: string,
  items: readonly { href: string; exact: boolean }[]
): number {
  const index = items.findIndex((item) => isNavActive(pathname, item.href, item.exact));
  return index === -1 ? 0 : index;
}

function useRovingTabIndex(
  itemCount: number,
  pathname: string,
  items: readonly { href: string; exact: boolean }[]
) {
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
      className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-primary/10 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      onKeyDown={handleKeyDown}
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 px-2">
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
              className={cn(
                "relative flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-medium transition-all duration-200 active:scale-95 sm:text-xs",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl transition-colors",
                  active && "bg-primary/10"
                )}
              >
                <Icon
                  className={cn("size-5", active && "stroke-[2.5]")}
                  aria-hidden="true"
                />
              </span>
              <span className="max-w-full truncate leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileNav() {
  return <MobileBottomNav />;
}

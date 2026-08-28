import {
  Briefcase,
  Home,
  IndianRupee,
  Package,
  ShoppingBag,
  User,
} from "lucide-react";

export const DESKTOP_NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/catalogue", label: "Catalogue", icon: ShoppingBag, exact: false },
  { href: "/payments", label: "Payments", icon: IndianRupee, exact: false },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase, exact: false },
  { href: "/orders", label: "Orders", icon: Package, exact: false },
  { href: "/profile", label: "Profile", icon: User, exact: false },
] as const;

export const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/catalogue", label: "Catalogue", icon: ShoppingBag, exact: false },
  { href: "/payments", label: "Payments", icon: IndianRupee, exact: false },
  { href: "/opportunities", label: "Tenders", icon: Briefcase, exact: false },
  { href: "/profile", label: "Profile", icon: User, exact: false },
] as const;

export function isNavActive(pathname: string, href: string, exact: boolean): boolean {
  if (href === "/opportunities") {
    return pathname === href || pathname.startsWith("/opportunities/");
  }
  if (href === "/payments") {
    return (
      pathname === href ||
      pathname.startsWith("/payments/") ||
      pathname === "/deadlock"
    );
  }
  if (href === "/orders") {
    return pathname === href || pathname.startsWith("/orders/");
  }
  if (href === "/catalogue") {
    return pathname === href || pathname.startsWith("/catalogue/");
  }
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

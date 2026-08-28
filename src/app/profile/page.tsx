"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Banknote,
  CheckCircle2,
  ChevronRight,
  IndianRupee,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  TrendingUp,
} from "lucide-react";

import { PageShell } from "@/components/PageShell";
import { ProfileSkeleton } from "@/components/skeletons";
import { SellerProfile } from "@/lib/schemas";
import { getSeller } from "@/lib/store";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const QUICK_LINKS = [
  { href: "/payments", label: "Payments", description: "Track CRAC & MSMED interest", icon: IndianRupee, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
  { href: "/orders", label: "Orders", description: "Deliveries & fulfilment", icon: ShoppingBag, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40" },
  { href: "/rating", label: "Seller Rating", description: "Improve your GeM score", icon: Star, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
  { href: "/impact", label: "Impact", description: "See your contribution", icon: TrendingUp, color: "text-violet-600 bg-violet-50 dark:bg-violet-950/40" },
  { href: "/settings", label: "Settings", description: "Export, import & reset", icon: Settings, color: "text-slate-600 bg-slate-50 dark:bg-slate-950/40" },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const profile = getSeller();
    if (!profile) {
      router.replace("/setup");
      return;
    }
    setSeller(profile);
    setReady(true);
  }, [router]);

  if (!ready || !seller) {
    return (
      <PageShell>
        <ProfileSkeleton />
      </PageShell>
    );
  }

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <PageShell className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground">
          Sahayak <span className="mx-1">›</span> <span className="font-semibold text-foreground">Profile</span>
        </p>
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight sm:text-3xl">My Profile</h1>
      </div>

      {/* Identity card — clean layout */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
            {getInitials(seller.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold">{seller.businessName}</h2>
            <p className="text-sm text-muted-foreground">{seller.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" aria-hidden="true" />
              {seller.city}, {seller.state}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {seller.mseCategory && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  MSE · {seller.mseCategory}
                </span>
              )}
              {seller.bankVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <ShieldCheck className="size-3" aria-hidden="true" />
                  Bank verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
              <Package className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Products</p>
              <p className="text-xs font-medium">{seller.products.join(", ")}</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Monthly capacity</p>
              <p className="text-xs font-bold tabular-nums">{seller.monthlyCapacity} units</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
              <Award className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Certifications</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {seller.certifications.map((cert) => (
                  <span key={cert} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">{cert}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 rounded-lg border bg-muted/30 p-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
              <Banknote className="size-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Compliance</p>
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                <span className="inline-flex items-center gap-1 font-medium">
                  <CheckCircle2 className={cn("size-3.5", seller.cautionMoneyPaid ? "text-green-600" : "text-muted-foreground")} />
                  Caution {seller.cautionMoneyPaid ? "Paid" : "Pending"}
                </span>
                <span className="inline-flex items-center gap-1 font-medium">
                  <CheckCircle2 className={cn("size-3.5", seller.bankVerified ? "text-green-600" : "text-muted-foreground")} />
                  Bank {seller.bankVerified ? "Verified" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit + Logout buttons */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/setup"
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Edit Profile
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted/50"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>

      {/* Quick links */}
      <section>
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Quick links</p>
        <div className="space-y-2">
          {QUICK_LINKS.map(({ href, label, description, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl border bg-card p-3 transition hover:bg-muted/30"
            >
              <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", color)}>
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

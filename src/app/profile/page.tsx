"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
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
import { CircularProgress } from "@/components/ui/circular-progress";
import { SellerProfile } from "@/lib/schemas";
import { getSeller } from "@/lib/store";
import { logout } from "@/lib/auth";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const QUICK_LINKS = [
  {
    href: "/payments",
    label: "Payments",
    description: "Track CRAC & MSMED interest liabilities",
    icon: IndianRupee,
    color: "text-orange-600 bg-orange-50 dark:bg-orange-950/40",
  },
  {
    href: "/orders",
    label: "Orders",
    description: "Manage deliveries, schedules & fulfillment",
    icon: ShoppingBag,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
  },
  {
    href: "/rating",
    label: "Seller Rating",
    description: "Improve your official GeM score matrix",
    icon: Star,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
  },
  {
    href: "/impact",
    label: "Impact & Growth",
    description: "See your corporate and MSME contributions",
    icon: TrendingUp,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Export catalog, import metrics & reset profile",
    icon: Settings,
    color: "text-slate-600 bg-slate-50 dark:bg-slate-950/40",
  },
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
      <PageShell wide>
        <ProfileSkeleton />
      </PageShell>
    );
  }

  function handleLogout() {
    logout();
    router.replace("/");
  }

  const capacityPercent = Math.min(100, Math.round((seller.monthlyCapacity / 67) * 100));

  return (
    <PageShell wide className="space-y-7">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0f172a] p-6 text-white shadow-xl md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.2)_0%,_transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-2xl font-bold backdrop-blur">
              {getInitials(seller.name)}
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                {seller.mseCategory && (
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase backdrop-blur">
                    MSE — {seller.mseCategory}
                  </span>
                )}
                {seller.bankVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-semibold text-emerald-300">
                    <ShieldCheck className="size-3" aria-hidden="true" />
                    Bank Verified
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {seller.businessName}
              </h1>
              <p className="mt-0.5 text-sm text-slate-300">{seller.name}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                <MapPin className="size-3" aria-hidden="true" />
                {seller.city}, {seller.state}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
            <Link
              href="/setup"
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        {/* Business specifications */}
        <section className="space-y-4 lg:col-span-8">
          <h2 className="text-lg font-bold text-foreground">Business Specifications</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Products */}
            <div className="relative rounded-2xl border bg-card p-5 shadow-sm">
              <Package
                className="absolute right-4 top-4 size-5 text-muted-foreground/40"
                aria-hidden="true"
              />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Products Catalogs
              </p>
              <p className="mt-2 text-sm font-medium leading-relaxed">
                {seller.products.slice(0, 3).join(", ")}
                {seller.products.length > 3 ? "…" : ""}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {seller.products.map((product) => (
                  <span
                    key={product}
                    className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>

            {/* Monthly capacity */}
            <div className="relative rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Monthly Capacity
                </p>
                <TrendingUp className="size-4 text-muted-foreground/40" aria-hidden="true" />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-extrabold tabular-nums">{seller.monthlyCapacity} units</p>
                  <p className="text-[10px] text-muted-foreground">Standard production quota per month</p>
                </div>
                <CircularProgress
                  value={capacityPercent}
                  max={100}
                  size={72}
                  strokeWidth={6}
                  variant="percent"
                />
              </div>
            </div>

            {/* Certifications */}
            <div className="relative rounded-2xl border bg-card p-5 shadow-sm">
              <Award
                className="absolute right-4 top-4 size-5 text-muted-foreground/40"
                aria-hidden="true"
              />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Certifications
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {seller.certifications.map((cert, i) => (
                  <span
                    key={cert}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold",
                      i === 0
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {/* Compliance */}
            <div className="relative rounded-2xl border bg-card p-5 shadow-sm">
              <ShieldCheck
                className="absolute right-4 top-4 size-5 text-muted-foreground/40"
                aria-hidden="true"
              />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Compliance Status
              </p>
              <div className="mt-3 space-y-2">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2
                    className={cn(
                      "size-4",
                      seller.cautionMoneyPaid ? "text-emerald-500" : "text-muted-foreground"
                    )}
                  />
                  Caution {seller.cautionMoneyPaid ? "Paid" : "Pending"}
                </span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2
                    className={cn(
                      "size-4",
                      seller.bankVerified ? "text-emerald-500" : "text-muted-foreground"
                    )}
                  />
                  Bank account verified
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick links */}
        <aside className="lg:col-span-4">
          <p className="mb-4 text-lg font-bold text-foreground">Quick Links</p>
          <div className="space-y-3">
            {QUICK_LINKS.map(({ href, label, description, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-sm transition hover:border-primary/20 hover:shadow-md"
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    color
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{description}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

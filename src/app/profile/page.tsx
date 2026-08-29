"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Circle,
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
    color: "text-primary bg-primary/10",
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
    color: "text-slate-600 bg-slate-100 dark:bg-slate-800",
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
    window.location.replace("/welcome");
  }

  const capacityPercent = Math.min(100, Math.round((seller.monthlyCapacity / 67) * 100));

  return (
    <PageShell wide className="pb-10">
      {/* Soft primary hero */}
      <section className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary via-primary to-[oklch(0.28_0.08_250)] p-6 text-primary-foreground shadow-lg md:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-1/3 size-48 rounded-full bg-sky-300/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/15 text-xl font-bold shadow-inner backdrop-blur sm:size-20 sm:text-2xl">
              {getInitials(seller.name)}
            </div>
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap gap-2">
                {seller.mseCategory && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-white/20">
                    MSE — {seller.mseCategory}
                  </span>
                )}
                {seller.bankVerified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-3 py-1 text-[10px] font-semibold text-emerald-100 ring-1 ring-emerald-300/30">
                    <ShieldCheck className="size-3" aria-hidden="true" />
                    Bank Verified
                  </span>
                )}
              </div>
              <h1 className="truncate text-2xl font-extrabold tracking-tight sm:text-3xl">
                {seller.businessName}
              </h1>
              <p className="text-sm text-primary-foreground/80">{seller.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-primary-foreground/65">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                {seller.city}, {seller.state}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 lg:shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 text-sm font-semibold transition hover:bg-white/20"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
            <Link
              href="/setup"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-primary shadow-sm transition hover:bg-white/90"
            >
              Edit profile
            </Link>
          </div>
        </div>
      </section>

      {/* Content — equal top gap, aligned columns */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">
            Business Specifications
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Products catalog
                </p>
                <Package className="size-4 text-muted-foreground/50" aria-hidden="true" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {seller.products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products listed yet</p>
                ) : (
                  seller.products.map((product) => (
                    <span
                      key={product}
                      className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-foreground ring-1 ring-primary/10"
                    >
                      {product}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Monthly capacity
                </p>
                <TrendingUp className="size-4 text-muted-foreground/50" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-2xl font-extrabold tabular-nums text-foreground">
                    {seller.monthlyCapacity}{" "}
                    <span className="text-base font-semibold text-muted-foreground">units</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Standard production quota per month
                  </p>
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

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Certifications
                </p>
                <Award className="size-4 text-muted-foreground/50" aria-hidden="true" />
              </div>
              <div className="flex flex-wrap gap-2">
                {seller.certifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">None added</p>
                ) : (
                  seller.certifications.map((cert, i) => (
                    <span
                      key={cert}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        i === 0
                          ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {cert}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  Compliance status
                </p>
                <ShieldCheck className="size-4 text-muted-foreground/50" aria-hidden="true" />
              </div>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2.5 text-sm font-medium">
                  {seller.cautionMoneyPaid ? (
                    <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <Circle className="size-4 text-amber-500" aria-hidden="true" />
                  )}
                  <span>
                    Caution money{" "}
                    <span className="text-muted-foreground">
                      · {seller.cautionMoneyPaid ? "Paid" : "Pending"}
                    </span>
                  </span>
                </li>
                <li className="flex items-center gap-2.5 text-sm font-medium">
                  {seller.bankVerified ? (
                    <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                  <span>
                    Bank account{" "}
                    <span className="text-muted-foreground">
                      · {seller.bankVerified ? "Verified" : "Not verified"}
                    </span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-4">
          <h2 className="mb-4 text-lg font-bold tracking-tight text-foreground">Quick Links</h2>
          <div className="space-y-3">
            {QUICK_LINKS.map(({ href, label, description, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3.5 rounded-2xl border bg-card p-4 shadow-sm transition hover:border-primary/25 hover:shadow-md"
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
                  <p className="text-sm font-semibold text-foreground">{label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {description}
                  </p>
                </div>
                <ChevronRight
                  className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

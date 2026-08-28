"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Armchair,
  CheckCircle2,
  Info,
  Package,
  Plus,
  Shield,
  Sofa,
  Sparkles,
  Table2,
} from "lucide-react";

import { CatalogueBuilder } from "@/components/CatalogueBuilder";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/ui/empty-state";
import { CardSkeleton } from "@/components/skeletons";
import { SellerProfile } from "@/lib/schemas";
import { getSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

const PRODUCT_ICONS = [Armchair, Sofa, Table2, Package] as const;
const PRODUCT_COLORS = [
  "text-blue-600 bg-blue-50",
  "text-emerald-600 bg-emerald-50",
  "text-amber-600 bg-amber-50",
  "text-violet-600 bg-violet-50",
] as const;

export default function CataloguePage() {
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
        <CardSkeleton rows={6} />
      </PageShell>
    );
  }

  const totalCerts = seller.certifications.length;
  const hasProducts = seller.products.length > 0;

  return (
    <PageShell wide className="space-y-5">
      {/* ── TWO-COLUMN LAYOUT: Main + Sidebar ── */}
      <div className="grid gap-5 lg:grid-cols-12">

        {/* ═══ LEFT — Main content ═══ */}
        <div className="space-y-5 lg:col-span-8">
          {/* Page header */}
          <section className="relative overflow-hidden rounded-2xl gradient-hero p-5 text-white shadow-xl md:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(96,165,250,0.25)_0%,_transparent_55%)]" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-200">Product catalogue</p>
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Build GeM-compliant listings</h1>
                <p className="max-w-lg text-sm text-blue-100/80">
                  33% of first submissions are rejected. Sahayak helps you get it right before you submit on gem.gov.in.
                </p>
              </div>
              <div className="flex gap-3 text-center">
                <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
                  <p className="text-xl font-bold tabular-nums leading-none">{seller.products.length}</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase text-blue-200/70">Products</p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
                  <p className="text-xl font-bold tabular-nums leading-none">{seller.monthlyCapacity}</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase text-blue-200/70">Capacity/mo</p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur">
                  <p className="text-xl font-bold tabular-nums leading-none">{totalCerts}</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase text-blue-200/70">Certs</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── PRODUCT LISTINGS TABLE — Advaz Latest Listings style ── */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">Your products</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  {seller.products.length}
                </span>
              </div>
              <a href="#catalogue-form" className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90">
                <Plus className="size-3" />
                Add product
              </a>
            </div>

            {hasProducts ? (
              <div>
                {/* Table header */}
                <div className="hidden border-b bg-muted/20 md:grid md:grid-cols-12 gap-4 px-5 py-2.5">
                  <div className="col-span-1" />
                  <div className="col-span-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Product</div>
                  <div className="col-span-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">HSN Code</div>
                  <div className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</div>
                  <div className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
                </div>

                {/* Product rows */}
                {seller.products.map((product, index) => {
                  const Icon = PRODUCT_ICONS[index % PRODUCT_ICONS.length];
                  const color = PRODUCT_COLORS[index % PRODUCT_COLORS.length];
                  return (
                    <div key={product} className="border-b last:border-b-0 transition-colors hover:bg-muted/20">
                      {/* Mobile */}
                      <div className="flex items-center gap-3 p-4 md:hidden">
                        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", color)}>
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold capitalize truncate">{product}</p>
                          <p className="text-xs text-muted-foreground">HSN mapped</p>
                        </div>
                        <span className="status-badge status-badge--success">
                          <CheckCircle2 className="size-3" /> Active
                        </span>
                      </div>
                      {/* Desktop — Advaz table row style */}
                      <div className="hidden md:grid md:grid-cols-12 md:items-center md:gap-4 px-5 py-3.5">
                        <div className="col-span-1">
                          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", color)}>
                            <Icon className="size-4.5" />
                          </div>
                        </div>
                        <div className="col-span-4">
                          <p className="text-sm font-bold capitalize">{product}</p>
                        </div>
                        <div className="col-span-3 text-xs text-muted-foreground">
                          HSN mapped · GST compliant
                        </div>
                        <div className="col-span-2 text-xs text-muted-foreground">
                          {seller.products.length > 1 ? "Furniture" : "General"}
                        </div>
                        <div className="col-span-2">
                          <span className="status-badge status-badge--success">
                            <CheckCircle2 className="size-3" /> Active
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6">
                <EmptyState
                  icon={Package}
                  title="No products listed"
                  description="Add your first product below to start matching tenders."
                  actions={[
                    { label: "Add product below", action: "#catalogue-form" },
                    { label: "Browse opportunities", action: "/opportunities", variant: "outline" },
                  ]}
                />
              </div>
            )}
          </div>

          {/* ── CATALOGUE BUILDER ── */}
          <div className="rounded-xl border bg-card shadow-sm" id="catalogue-form">
            <div className="flex items-center gap-2 border-b bg-muted/30 px-5 py-3">
              <Sparkles className="size-4 text-primary" />
              <div>
                <p className="text-sm font-bold">Catalogue builder</p>
                <p className="text-[10px] text-muted-foreground">5-step wizard — product, parameters, images, pricing, review</p>
              </div>
            </div>
            <div className="p-4 md:p-5">
              <CatalogueBuilder seller={seller} />
            </div>
          </div>

          <p className="text-center text-[10px] text-muted-foreground">
            Draft data only — final submission happens on{" "}
            <a href="https://gem.gov.in" target="_blank" rel="noopener" className="font-semibold text-primary hover:underline">gem.gov.in</a>
          </p>
        </div>

        {/* ═══ RIGHT — Sidebar (Advaz CMS Settings style) ═══ */}
        <aside className="space-y-4 lg:col-span-4 lg:sticky lg:top-20 lg:self-start">
          {/* Rejection tips */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <AlertTriangle className="size-3.5" />
              </div>
              <p className="text-xs font-bold">Rejection tips</p>
            </div>
            <div className="space-y-2 text-[11px] text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 size-1 shrink-0 rounded-full bg-red-500" />
                <p>Missing BIS certification is the #1 rejection reason on GeM.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 size-1 shrink-0 rounded-full bg-amber-500" />
                <p>Wrong HSN codes cause 15% of first-submission failures.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 size-1 shrink-0 rounded-full bg-blue-500" />
                <p>Images must be 800×800px with white backgrounds.</p>
              </div>
            </div>
          </div>

          {/* Compliance score */}
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Shield className="size-3.5" />
              </div>
              <p className="text-xs font-bold">Compliance score</p>
            </div>
            <div className="space-y-2">
              {[
                { label: "Products listed", value: Math.min(seller.products.length, 3), max: 3 },
                { label: "HSN codes mapped", value: Math.min(seller.products.length, 3), max: 3 },
                { label: "Certifications", value: Math.min(totalCerts, 3), max: 3 },
                { label: "Capacity set", value: seller.monthlyCapacity > 0 ? 1 : 0, max: 1 },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-medium">{item.label}</span>
                    <span className="tabular-nums text-muted-foreground">{item.value}/{item.max}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="rounded-xl border border-dashed border-muted-foreground/20 p-3 text-center">
            <Info className="mx-auto size-4 text-muted-foreground" />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Add more products to improve your match score
            </p>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}

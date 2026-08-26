"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageShell } from "@/components/PageShell";
import { ProfileSkeleton } from "@/components/skeletons";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SellerProfile } from "@/lib/schemas";
import { getSeller } from "@/lib/store";

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

  return (
    <PageShell>
      <div className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Your seller business profile</p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{seller.businessName}</CardTitle>
          <CardDescription>
            {seller.name} · {seller.city}, {seller.state}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="text-muted-foreground">Products</p>
            <p className="font-medium">{seller.products.join(", ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Monthly capacity</p>
            <p className="font-medium">{seller.monthlyCapacity} units</p>
          </div>
          <div>
            <p className="text-muted-foreground">Certifications</p>
            <p className="font-medium">{seller.certifications.join(", ")}</p>
          </div>
          <div>
            <p className="text-muted-foreground">MSE category</p>
            <p className="font-medium capitalize">{seller.mseCategory ?? "Not set"}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Caution money</p>
              <p className="font-medium">{seller.cautionMoneyPaid ? "Paid" : "Pending"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bank verified</p>
              <p className="font-medium">{seller.bankVerified ? "Yes" : "No"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link
        href="/setup"
        className={buttonVariants({ size: "lg", className: "h-11 w-full" })}
      >
        Edit Profile
      </Link>
    </PageShell>
  );
}

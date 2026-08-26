"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import sellersData from "@/data/sellers.json";
import { DocumentCheckerSection } from "@/components/DocumentCheckerSection";
import { PageShell } from "@/components/PageShell";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MseCategory, SellerProfile } from "@/lib/schemas";
import { getSeller, setSeller } from "@/lib/store";
import { cn } from "@/lib/utils";

const CERTIFICATION_OPTIONS = [
  "BIS",
  "ISO 9001",
  "ISO 14001",
  "Udyam-Micro",
  "Udyam",
] as const;

const MSE_OPTIONS: { value: MseCategory; label: string }[] = [
  { value: "micro", label: "Micro" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
];

const defaultSeller = sellersData[0] as SellerProfile;

type FormState = {
  name: string;
  businessName: string;
  city: string;
  state: string;
  products: string;
  monthlyCapacity: string;
  certifications: string[];
  mseCategory: MseCategory;
};

function sellerToFormState(seller: SellerProfile): FormState {
  return {
    name: seller.name,
    businessName: seller.businessName,
    city: seller.city,
    state: seller.state,
    products: seller.products.join(", "),
    monthlyCapacity: String(seller.monthlyCapacity),
    certifications: seller.certifications,
    mseCategory: seller.mseCategory ?? "micro",
  };
}

function formStateToSeller(form: FormState, base: SellerProfile): SellerProfile {
  return {
    ...base,
    name: form.name.trim(),
    businessName: form.businessName.trim(),
    city: form.city.trim(),
    state: form.state.trim(),
    products: form.products
      .split(",")
      .map((product) => product.trim())
      .filter(Boolean),
    monthlyCapacity: Number(form.monthlyCapacity),
    certifications: form.certifications,
    mseCategory: form.mseCategory,
  };
}

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(sellerToFormState(defaultSeller));
  const [baseSeller, setBaseSeller] = useState<SellerProfile>(defaultSeller);
  const [email, setEmail] = useState("ramesh@furnitureworks.demo");
  const [bankAccount, setBankAccount] = useState("123456789012");
  const [ifsc, setIfsc] = useState("SBIN0001234");

  useEffect(() => {
    const saved = getSeller();
    if (saved) {
      setBaseSeller(saved);
      setForm(sellerToFormState(saved));
    }
  }, []);

  const liveSeller = useMemo(
    () => formStateToSeller(form, baseSeller),
    [form, baseSeller]
  );

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleCertification(cert: string) {
    setForm((current) => ({
      ...current,
      certifications: current.certifications.includes(cert)
        ? current.certifications.filter((item) => item !== cert)
        : [...current.certifications, cert],
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const seller = formStateToSeller(form, baseSeller);
    setSeller(seller);
    router.push("/opportunities");
  }

  return (
    <PageShell className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seller Setup</CardTitle>
          <CardDescription>
            Review your business profile before finding matching tenders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  value={form.businessName}
                  onChange={(event) =>
                    updateField("businessName", event.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(event) => updateField("state", event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="products">Products (comma separated)</Label>
              <Input
                id="products"
                value={form.products}
                onChange={(event) => updateField("products", event.target.value)}
                placeholder="office chair, ergonomic chair"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Monthly capacity (units)</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={form.monthlyCapacity}
                onChange={(event) =>
                  updateField("monthlyCapacity", event.target.value)
                }
                required
              />
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Certifications</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {CERTIFICATION_OPTIONS.map((cert) => (
                  <label
                    key={cert}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={form.certifications.includes(cert)}
                      onChange={() => toggleCertification(cert)}
                      className="size-4 rounded border-input"
                    />
                    {cert}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">MSE category</legend>
              <div className="flex flex-wrap gap-3">
                {MSE_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      form.mseCategory === value && "border-primary bg-primary/5"
                    )}
                  >
                    <input
                      type="radio"
                      name="mseCategory"
                      value={value}
                      checked={form.mseCategory === value}
                      onChange={() => updateField("mseCategory", value)}
                      className="size-4"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button type="submit" size="lg" className="h-11 px-6">
                Find Opportunities
              </Button>
              <Link
                href="/"
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "h-11 px-6",
                })}
              >
                Back
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <DocumentCheckerSection
            seller={liveSeller}
            email={email}
            bankAccount={bankAccount}
            ifsc={ifsc}
            onEmailChange={setEmail}
            onBankAccountChange={setBankAccount}
            onIfscChange={setIfsc}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}

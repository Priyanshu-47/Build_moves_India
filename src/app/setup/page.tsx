"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import sellersData from "@/data/sellers.json";
import categoriesData from "@/data/categories.json";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmationPanel } from "@/components/ui/confirmation-panel";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ErrorSummary } from "@/components/ui/error-summary";
import { fieldDescribedBy, FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Stepper, StepperStep } from "@/components/ui/stepper";
import { MseCategory, SellerProfile } from "@/lib/schemas";
import {
  clearDraft,
  loadDraft,
  saveDraft,
  setSeller,
  SetupDraftData,
  getSeller,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { focusElementById } from "@/lib/a11y/focus";

const STEPS: StepperStep[] = [
  { id: "business", label: "Business Details", shortLabel: "Business" },
  { id: "products", label: "Products & Capacity", shortLabel: "Products" },
  { id: "certifications", label: "Certifications & MSE", shortLabel: "Certs" },
  { id: "documents", label: "Documents & Bank", shortLabel: "Bank" },
];

const STEP_ICONS = ["🏢", "📦", "📜", "🏦"] as const;

const CITY_TO_STATE: Record<string, string> = {
  jaipur: "Rajasthan",
  jodhpur: "Rajasthan",
  udaipur: "Rajasthan",
  delhi: "Delhi",
  "new delhi": "Delhi",
  mumbai: "Maharashtra",
  pune: "Maharashtra",
  bangalore: "Karnataka",
  bengaluru: "Karnataka",
  chennai: "Tamil Nadu",
  ahmedabad: "Gujarat",
  kolkata: "West Bengal",
  lucknow: "Uttar Pradesh",
  hyderabad: "Andhra Pradesh",
};

const CERTIFICATION_OPTIONS = ["BIS", "ISO 9001", "Udyam-Micro", "Udyam"] as const;

const MSE_OPTIONS: { value: MseCategory; label: string }[] = [
  { value: "micro", label: "Micro" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
];

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Delhi",
  "Gujarat",
  "Karnataka",
  "Maharashtra",
  "Rajasthan",
  "Tamil Nadu",
  "Uttar Pradesh",
  "West Bengal",
] as const;

type CategoryNode = {
  id: string;
  name: string;
  children?: CategoryNode[];
};

function flattenCategories(node: CategoryNode, trail: string[] = []): { id: string; label: string }[] {
  const path = [...trail, node.name];
  const results: { id: string; label: string }[] = [];

  if (!node.children || node.children.length === 0) {
    results.push({ id: node.id, label: path.join(" › ") });
    return results;
  }

  for (const child of node.children) {
    results.push(...flattenCategories(child, path));
  }
  return results;
}

const CATEGORY_OPTIONS = flattenCategories(categoriesData as CategoryNode);

const defaultSeller = sellersData[0] as SellerProfile;

function FieldValidMark({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400" role="status">
      <Check className="size-3.5" aria-hidden="true" />
      Looks good
    </p>
  );
}

function emptyDraft(): SetupDraftData {
  return {
    businessName: "",
    name: "",
    city: "",
    state: "",
    products: "",
    monthlyCapacity: "",
    primaryCategory: "",
    certifications: [],
    mseCategory: "micro",
    udyamNumber: "",
    gstin: "",
    pan: "",
    bankAccount: "",
    ifsc: "",
    email: "",
  };
}

function sellerToDraft(seller: SellerProfile): SetupDraftData {
  return {
    businessName: seller.businessName,
    name: seller.name,
    city: seller.city,
    state: seller.state,
    products: seller.products.join(", "),
    monthlyCapacity: String(seller.monthlyCapacity),
    primaryCategory: CATEGORY_OPTIONS[0]?.id ?? "",
    certifications: seller.certifications,
    mseCategory: seller.mseCategory ?? "micro",
    udyamNumber: "",
    gstin: seller.gstin ?? "",
    pan: seller.pan ?? "",
    bankAccount: "",
    ifsc: "",
    email: "",
  };
}

function draftToSeller(data: SetupDraftData, base: SellerProfile): SellerProfile {
  return {
    ...base,
    name: data.name.trim(),
    businessName: data.businessName.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    products: data.products
      .split(",")
      .map((product) => product.trim())
      .filter(Boolean),
    monthlyCapacity: Number(data.monthlyCapacity),
    certifications: data.certifications,
    mseCategory: data.mseCategory,
    gstin: data.gstin.trim(),
    pan: data.pan.trim(),
    bankVerified: Boolean(data.bankAccount.trim() && data.ifsc.trim()),
  };
}

type FieldError = { field: string; message: string };

function validateStep(step: number, data: SetupDraftData): FieldError[] {
  const errors: FieldError[] = [];

  if (step === 0) {
    if (!data.businessName.trim()) {
      errors.push({ field: "field-businessName", message: "Enter your business name" });
    }
    if (!data.name.trim()) {
      errors.push({ field: "field-name", message: "Enter the owner name" });
    }
    if (!data.city.trim()) {
      errors.push({ field: "field-city", message: "Enter your city" });
    }
    if (!data.state.trim()) {
      errors.push({ field: "field-state", message: "Select your state" });
    }
  }

  if (step === 1) {
    if (!data.products.trim()) {
      errors.push({ field: "field-products", message: "Enter at least one product" });
    }
    if (!data.monthlyCapacity.trim() || Number(data.monthlyCapacity) <= 0) {
      errors.push({ field: "field-monthlyCapacity", message: "Enter a valid monthly capacity" });
    }
    if (!data.primaryCategory) {
      errors.push({ field: "field-primaryCategory", message: "Select a primary category" });
    }
  }

  if (step === 3) {
    if (!data.gstin.trim()) {
      errors.push({ field: "field-gstin", message: "Enter your GSTIN" });
    }
    if (!data.pan.trim()) {
      errors.push({ field: "field-pan", message: "Enter your PAN" });
    }
    if (!data.bankAccount.trim()) {
      errors.push({ field: "field-bankAccount", message: "Enter your bank account number" });
    }
    if (!data.ifsc.trim()) {
      errors.push({ field: "field-ifsc", message: "Enter your IFSC code" });
    }
    if (!data.email.trim()) {
      errors.push({ field: "field-email", message: "Enter your email address" });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.push({ field: "field-email", message: "Enter a valid email address" });
    }
  }

  return errors;
}

export default function SetupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<SetupDraftData>(emptyDraft());
  const [baseSeller, setBaseSeller] = useState<SellerProfile>(defaultSeller);
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [draftSaved, setDraftSaved] = useState(false);
  const [resumePrompt, setResumePrompt] = useState<SetupDraftData | null>(null);
  const [resumeStep, setResumeStep] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [savedSeller, setSavedSeller] = useState<SellerProfile | null>(null);
  const [slideDirection, setSlideDirection] = useState<"forward" | "back">("forward");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = getSeller();
    if (saved) {
      setBaseSeller(saved);
      setForm(sellerToDraft(saved));
    } else {
      setForm((current) => ({
        ...current,
        primaryCategory: CATEGORY_OPTIONS[0]?.id ?? "",
      }));
    }

    const draft = loadDraft();
    if (draft) {
      setResumePrompt(draft.data);
      setResumeStep(draft.step);
    }
    setInitialized(true);
  }, []);

  const persistDraft = useCallback(
    (step: number, data: SetupDraftData) => {
      saveDraft(step, data);
      setDraftSaved(true);
    },
    []
  );

  useEffect(() => {
    if (!initialized || resumePrompt !== null) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      persistDraft(currentStep, form);
    }, 500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [form, currentStep, initialized, persistDraft, resumePrompt]);

  const stepTitle = STEPS[currentStep]?.label ?? "";

  function updateField<K extends keyof SetupDraftData>(key: K, value: SetupDraftData[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "city" && typeof value === "string") {
        const mapped = CITY_TO_STATE[value.trim().toLowerCase()];
        if (mapped && !current.state) {
          next.state = mapped;
        }
      }
      return next;
    });
    setFieldErrors((current) => {
      const next = { ...current };
      const fieldId = `field-${key}`;
      delete next[fieldId];
      return next;
    });
    setErrors([]);
  }

  function toggleCertification(cert: string) {
    setForm((current) => ({
      ...current,
      certifications: current.certifications.includes(cert)
        ? current.certifications.filter((item) => item !== cert)
        : [...current.certifications, cert],
    }));
    setErrors([]);
  }

  function applyFieldErrors(nextErrors: FieldError[]) {
    setErrors(nextErrors);
    const map: Record<string, string> = {};
    for (const error of nextErrors) {
      map[error.field] = error.message;
    }
    setFieldErrors(map);
    if (nextErrors.length > 0) {
      queueMicrotask(() => focusElementById("error-summary"));
    }
  }

  function handleNext() {
    const stepErrors = validateStep(currentStep, form);
    if (stepErrors.length > 0) {
      applyFieldErrors(stepErrors);
      return;
    }

    setErrors([]);
    setFieldErrors({});
    if (currentStep < STEPS.length - 1) {
      setSlideDirection("forward");
      setCurrentStep((step) => step + 1);
    }
  }

  function handleBack() {
    setErrors([]);
    setFieldErrors({});
    setSlideDirection("back");
    setCurrentStep((step) => Math.max(0, step - 1));
  }

  function handleSaveDraft() {
    persistDraft(currentStep, form);
  }

  function handleResume() {
    if (resumePrompt) {
      setForm(resumePrompt);
      setCurrentStep(resumeStep);
    }
    setResumePrompt(null);
  }

  function handleStartFresh() {
    clearDraft();
    const saved = getSeller();
    setForm(saved ? sellerToDraft(saved) : emptyDraft());
    setCurrentStep(0);
    setResumePrompt(null);
    setDraftSaved(false);
  }

  function handleComplete(event: FormEvent) {
    event.preventDefault();
    const stepErrors = validateStep(3, form);
    if (stepErrors.length > 0) {
      applyFieldErrors(stepErrors);
      return;
    }

    const seller = draftToSeller(form, baseSeller);
    setSeller(seller);
    clearDraft();
    setSavedSeller(seller);
    setCompleted(true);
  }

  const errorMap = useMemo(() => fieldErrors, [fieldErrors]);

  useEffect(() => {
    if (completed) {
      queueMicrotask(() => focusElementById("confirmation-panel"));
    }
  }, [completed]);

  if (!initialized) {
    return (
      <PageShell>
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Loading setup…
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  if (completed && savedSeller) {
    return (
      <PageShell className="space-y-6">
        <div className="relative overflow-hidden rounded-xl border bg-green-50 p-8 text-center dark:bg-green-950/20">
          <div className="pointer-events-none absolute inset-0 flex items-start justify-center gap-2 pt-4" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="confetti-piece inline-block size-2 rounded-full"
                style={{
                  backgroundColor: ["#1E3A5F", "#16a34a", "#ca8a04", "#dc2626"][i % 4],
                  animationDelay: `${i * 0.1}s`,
                  marginLeft: `${(i - 6) * 20}px`,
                }}
              />
            ))}
          </div>
          <p className="text-4xl" aria-hidden="true">🎉</p>
          <h2 className="mt-2 text-2xl font-bold">You&apos;re all set!</h2>
          <p className="mt-1 text-muted-foreground">
            Welcome, {savedSeller.name}. Your profile is ready.
          </p>
        </div>
        <ConfirmationPanel
          title="Profile saved successfully"
          summary={[
            { label: "Name", value: savedSeller.name },
            { label: "Business", value: savedSeller.businessName },
            { label: "City", value: `${savedSeller.city}, ${savedSeller.state}` },
            {
              label: "Products",
              value: savedSeller.products.join(", ") || "None listed",
            },
          ]}
          whatNext={["Find matching tenders", "List your products"]}
          actions={[
            { label: "View opportunities", action: "/opportunities" },
            { label: "Add products", action: "/catalogue", variant: "outline" },
          ]}
        />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <PageHeader
        title="Complete Your Profile"
        backUrl="/"
        subtitle={`Step ${currentStep + 1} of ${STEPS.length} — ${stepTitle}`}
      />

      {resumePrompt && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Continue where you left off?</CardTitle>
            <CardDescription>
              We found a saved draft from step {resumeStep + 1} of {STEPS.length}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleResume}>
              Resume draft
            </Button>
            <Button type="button" variant="outline" onClick={handleStartFresh}>
              Start fresh
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mx-auto w-full max-w-3xl">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>Seller setup</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">{STEP_ICONS[currentStep]}</span>
                {stepTitle}
              </CardDescription>
            </div>
            {draftSaved && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                <Check className="size-3.5" aria-hidden="true" />
                Draft saved
              </span>
            )}
          </div>
          <Stepper
            steps={STEPS}
            currentStep={currentStep}
            onStepChange={(step) => {
              if (step < currentStep) {
                setCurrentStep(step);
                setErrors([]);
                setFieldErrors({});
              }
            }}
            onComplete={() => {
              const formElement = document.getElementById("setup-form");
              if (formElement instanceof HTMLFormElement) {
                formElement.requestSubmit();
              }
            }}
          />
        </CardHeader>

        <CardContent>
          <form id="setup-form" onSubmit={handleComplete} className="space-y-6" noValidate>
            <ErrorSummary errors={errors} />

            <div
              key={currentStep}
              className={slideDirection === "forward" ? "slide-in-forward" : "slide-in-back"}
            >
            {currentStep === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Business name"
                  htmlFor="field-businessName"
                  required
                  error={errorMap["field-businessName"]}
                >
                  <Input
                    id="field-businessName"
                    value={form.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    aria-invalid={Boolean(errorMap["field-businessName"])}
                    aria-describedby={fieldDescribedBy(
                      "field-businessName",
                      errorMap["field-businessName"]
                    )}
                    autoComplete="organization"
                  />
                  <FieldValidMark show={Boolean(form.businessName.trim()) && !errorMap["field-businessName"]} />
                </FormField>
                <FormField
                  label="Owner name"
                  htmlFor="field-name"
                  required
                  error={errorMap["field-name"]}
                >
                  <Input
                    id="field-name"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    aria-invalid={Boolean(errorMap["field-name"])}
                    aria-describedby={fieldDescribedBy("field-name", errorMap["field-name"])}
                    autoComplete="name"
                  />
                  <FieldValidMark show={Boolean(form.name.trim()) && !errorMap["field-name"]} />
                </FormField>
                <FormField
                  label="City"
                  htmlFor="field-city"
                  required
                  error={errorMap["field-city"]}
                >
                  <Input
                    id="field-city"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    aria-invalid={Boolean(errorMap["field-city"])}
                    aria-describedby={fieldDescribedBy("field-city", errorMap["field-city"])}
                    autoComplete="address-level2"
                  />
                  <FieldValidMark show={Boolean(form.city.trim()) && !errorMap["field-city"]} />
                </FormField>
                <FormField
                  label="State"
                  htmlFor="field-state"
                  required
                  error={errorMap["field-state"]}
                >
                  <select
                    id="field-state"
                    value={form.state}
                    onChange={(e) => updateField("state", e.target.value)}
                    aria-invalid={Boolean(errorMap["field-state"])}
                    aria-describedby={fieldDescribedBy("field-state", errorMap["field-state"])}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <FieldValidMark show={Boolean(form.state) && !errorMap["field-state"]} />
                </FormField>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <FormField
                  label="Products"
                  htmlFor="field-products"
                  required
                  hint="Comma separated — e.g. office chair, revolving chair"
                  error={errorMap["field-products"]}
                >
                  <Input
                    id="field-products"
                    value={form.products}
                    onChange={(e) => updateField("products", e.target.value)}
                    placeholder="office chair, ergonomic chair"
                    aria-invalid={Boolean(errorMap["field-products"])}
                    aria-describedby={fieldDescribedBy(
                      "field-products",
                      errorMap["field-products"],
                      "Comma separated — e.g. office chair, revolving chair"
                    )}
                  />
                </FormField>
                <FormField
                  label="Monthly capacity (units)"
                  htmlFor="field-monthlyCapacity"
                  required
                  error={errorMap["field-monthlyCapacity"]}
                >
                  <Input
                    id="field-monthlyCapacity"
                    type="number"
                    min={1}
                    value={form.monthlyCapacity}
                    onChange={(e) => updateField("monthlyCapacity", e.target.value)}
                    aria-invalid={Boolean(errorMap["field-monthlyCapacity"])}
                    aria-describedby={fieldDescribedBy(
                      "field-monthlyCapacity",
                      errorMap["field-monthlyCapacity"]
                    )}
                  />
                </FormField>
                <FormField
                  label="Primary category"
                  htmlFor="field-primaryCategory"
                  required
                  hint="GeM category that best matches your catalogue"
                  error={errorMap["field-primaryCategory"]}
                >
                  <select
                    id="field-primaryCategory"
                    value={form.primaryCategory}
                    onChange={(e) => updateField("primaryCategory", e.target.value)}
                    aria-invalid={Boolean(errorMap["field-primaryCategory"])}
                    aria-describedby={fieldDescribedBy(
                      "field-primaryCategory",
                      errorMap["field-primaryCategory"],
                      "GeM category that best matches your catalogue"
                    )}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
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

                <FormField
                  label="Udyam number"
                  htmlFor="field-udyamNumber"
                  hint="Optional — speeds up MSE verification"
                >
                  <Input
                    id="field-udyamNumber"
                    value={form.udyamNumber}
                    onChange={(e) => updateField("udyamNumber", e.target.value)}
                    placeholder="UDYAM-XX-00-0000000"
                  />
                </FormField>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="GSTIN"
                  htmlFor="field-gstin"
                  required
                  error={errorMap["field-gstin"]}
                >
                  <Input
                    id="field-gstin"
                    value={form.gstin}
                    onChange={(e) => updateField("gstin", e.target.value.toUpperCase())}
                    aria-invalid={Boolean(errorMap["field-gstin"])}
                    aria-describedby={fieldDescribedBy("field-gstin", errorMap["field-gstin"])}
                  />
                </FormField>
                <FormField
                  label="PAN"
                  htmlFor="field-pan"
                  required
                  error={errorMap["field-pan"]}
                >
                  <Input
                    id="field-pan"
                    value={form.pan}
                    onChange={(e) => updateField("pan", e.target.value.toUpperCase())}
                    aria-invalid={Boolean(errorMap["field-pan"])}
                    aria-describedby={fieldDescribedBy("field-pan", errorMap["field-pan"])}
                  />
                </FormField>
                <FormField
                  label="Bank account number"
                  htmlFor="field-bankAccount"
                  required
                  error={errorMap["field-bankAccount"]}
                >
                  <Input
                    id="field-bankAccount"
                    value={form.bankAccount}
                    onChange={(e) => updateField("bankAccount", e.target.value)}
                    aria-invalid={Boolean(errorMap["field-bankAccount"])}
                    aria-describedby={fieldDescribedBy(
                      "field-bankAccount",
                      errorMap["field-bankAccount"]
                    )}
                    autoComplete="off"
                  />
                </FormField>
                <FormField
                  label="IFSC code"
                  htmlFor="field-ifsc"
                  required
                  error={errorMap["field-ifsc"]}
                >
                  <Input
                    id="field-ifsc"
                    value={form.ifsc}
                    onChange={(e) => updateField("ifsc", e.target.value.toUpperCase())}
                    aria-invalid={Boolean(errorMap["field-ifsc"])}
                    aria-describedby={fieldDescribedBy("field-ifsc", errorMap["field-ifsc"])}
                  />
                </FormField>
                <FormField
                  label="Email"
                  htmlFor="field-email"
                  required
                  error={errorMap["field-email"]}
                  className="sm:col-span-2"
                >
                  <Input
                    id="field-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={Boolean(errorMap["field-email"])}
                    aria-describedby={fieldDescribedBy("field-email", errorMap["field-email"])}
                    autoComplete="email"
                  />
                </FormField>
              </div>
            )}

            </div>

            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:flex-wrap sm:items-center">
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              {currentStep < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" size="lg">
                  Complete setup
                </Button>
              )}
              <Button type="button" variant="secondary" onClick={handleSaveDraft}>
                Save as draft
              </Button>
              <Link href="/" className={buttonVariants({ variant: "ghost" })}>
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}

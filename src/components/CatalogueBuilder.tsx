"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ImagePlus,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { Progress } from "@/components/ui/progress";
import { SellerProfile } from "@/lib/schemas";
import {
  CatalogueDraft,
  CatalogueImage,
  checkCatalogueCompliance,
  generateCatalogueDraft,
  suggestCategory,
} from "@/lib/rules/catalogue";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Product", key: "product" as const },
  { id: 2, title: "Parameters", key: "parameters" as const },
  { id: 3, title: "Images", key: "images" as const },
  { id: 4, title: "Pricing", key: "pricing" as const },
  { id: 5, title: "Review", key: "review" as const },
];

type CatalogueBuilderProps = {
  seller: SellerProfile;
};

function StepIcon({ status }: { status: "pass" | "warn" | "fail" | "pending" }) {
  if (status === "pass") {
    return <CheckCircle2 className="size-4 text-green-600" aria-hidden="true" />;
  }
  if (status === "warn") {
    return <AlertTriangle className="size-4 text-yellow-600" aria-hidden="true" />;
  }
  if (status === "fail") {
    return <XCircle className="size-4 text-red-600" aria-hidden="true" />;
  }
  return <Circle className="size-4 text-muted-foreground" aria-hidden="true" />;
}

export function CatalogueBuilder({ seller }: CatalogueBuilderProps) {
  const [step, setStep] = useState(1);
  const [productName, setProductName] = useState("");
  const [draft, setDraft] = useState<CatalogueDraft | null>(null);
  const [specs, setSpecs] = useState<Record<string, string>>({});
  const [images, setImages] = useState<CatalogueImage[]>([]);
  const [unitPrice, setUnitPrice] = useState("");

  const suggestedCategory = useMemo(
    () => (productName.trim() ? suggestCategory(productName) : null),
    [productName]
  );

  const compliance = useMemo(() => {
    if (!draft) return null;
    return checkCatalogueCompliance(productName, specs, images, {
      hsnCode: draft.hsnCode,
      gstRate: draft.gstRate,
      unitPrice: unitPrice ? Number(unitPrice) : undefined,
      bisRequired: draft.bisRequired,
      sellerCertifications: seller.certifications,
      priceRange: draft.priceRange,
      expectedParameters: draft.goldenParameters,
    });
  }, [draft, productName, specs, images, unitPrice, seller.certifications]);

  function handleSuggestProduct() {
    if (!productName.trim()) return;
    const generated = generateCatalogueDraft(productName, seller);
    if (generated) {
      setDraft(generated);
      setSpecs({ ...generated.goldenParameters });
    }
  }

  function updateSpec(key: string, value: string) {
    setSpecs((current) => ({ ...current, [key]: value }));
  }

  function addMockImage(compliant: boolean) {
    const index = images.length + 1;
    setImages((current) => [
      ...current,
      {
        id: `img-${Date.now()}`,
        name: `product-photo-${index}.jpg`,
        width: compliant ? 1000 : 640,
        height: compliant ? 1000 : 640,
        whiteBackground: compliant,
      },
    ]);
  }

  function removeImage(id: string) {
    setImages((current) => current.filter((img) => img.id !== id));
  }

  function getStepStatus(stepId: number): "pass" | "warn" | "fail" | "pending" {
    if (!compliance) return stepId < step ? "pass" : "pending";
    if (stepId > step) return "pending";

    switch (stepId) {
      case 1:
        return draft ? "pass" : "fail";
      case 2: {
        const paramCheck = compliance.checks.find((c) => c.id === "golden_parameters");
        return paramCheck?.status ?? "pending";
      }
      case 3: {
        const imageChecks = compliance.checks.filter((c) => c.id.startsWith("image"));
        if (imageChecks.some((c) => c.status === "fail")) return "fail";
        if (imageChecks.every((c) => c.status === "pass")) return "pass";
        return "warn";
      }
      case 4: {
        const priceCheck = compliance.checks.find((c) => c.id === "price_range");
        return priceCheck?.status ?? "pending";
      }
      case 5:
        return compliance.readyToList ? "pass" : compliance.score >= 60 ? "warn" : "fail";
      default:
        return "pending";
    }
  }

  const rejectionKey = STEPS[step - 1].key;
  const rejectionHint =
    draft && rejectionKey !== "review"
      ? draft.rejectionReasons[rejectionKey as keyof typeof draft.rejectionReasons]
      : draft?.rejectionReasons.pricing;

  function canGoNext(): boolean {
    switch (step) {
      case 1:
        return Boolean(draft);
      case 2:
        return Object.values(specs).some((v) => v.trim().length > 0);
      case 3:
        return images.length > 0;
      case 4:
        return Boolean(unitPrice && Number(unitPrice) > 0);
      default:
        return true;
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Catalogue progress</span>
          <span className="text-muted-foreground tabular-nums">
            Step {step} of {STEPS.length}
          </span>
        </div>
        <Progress value={(step / STEPS.length) * 100} />
        <ol className="flex justify-between gap-1">
          {STEPS.map(({ id, title }) => (
            <li
              key={id}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 text-center",
                id === step && "font-medium text-primary"
              )}
            >
              <StepIcon status={getStepStatus(id)} />
              <span className="truncate text-[10px] sm:text-xs">{title}</span>
            </li>
          ))}
        </ol>
      </div>

      {rejectionHint && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100">
          <strong>GeM rejection tip:</strong> {rejectionHint}
        </div>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1 — Product name</CardTitle>
            <CardDescription>
              Enter your product — we&apos;ll suggest category, HSN code, and golden
              parameters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Combobox
                id="productName"
                label="Product name"
                value={productName}
                onValueChange={setProductName}
                suggestions={seller.products}
                placeholder="e.g. office chair, revolving chair"
              />
            </div>

            <Button type="button" onClick={handleSuggestProduct} disabled={!productName.trim()}>
              Suggest category & HSN
            </Button>

            {suggestedCategory && !draft && (
              <p className="text-sm text-muted-foreground">
                Detected: {suggestedCategory.categoryPath.join(" › ")} — click suggest to
                confirm.
              </p>
            )}

            {draft && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  {draft.categoryPath.join(" › ")}
                </p>
                <p>
                  <span className="text-muted-foreground">HSN:</span> {draft.hsnCode} (
                  {draft.hsnDisplay})
                </p>
                <p>
                  <span className="text-muted-foreground">GST:</span> {draft.gstRate}%
                </p>
                <p>
                  <span className="text-muted-foreground">BIS required:</span>{" "}
                  {draft.bisRequired ? "Yes" : "No"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 2 && draft && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2 — Golden parameters</CardTitle>
            <CardDescription>
              Pre-filled from GeM category mapping. Edit to match your product.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(draft.goldenParameters).map(([key]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{key}</Label>
                <Input
                  id={key}
                  value={specs[key] ?? ""}
                  onChange={(event) => updateSpec(key, event.target.value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3 — Product images</CardTitle>
            <CardDescription>
              Mock upload — GeM requires 3+ images at 800×800px, white background.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => addMockImage(true)}>
                <ImagePlus className="size-4" aria-hidden="true" />
                Add compliant image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addMockImage(false)}
              >
                Add non-compliant (demo)
              </Button>
            </div>

            {images.length === 0 ? (
              <p className="text-sm text-muted-foreground">No images added yet.</p>
            ) : (
              <ul className="space-y-2">
                {images.map((image) => (
                  <li
                    key={image.id}
                    className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{image.name}</p>
                      <p className="text-muted-foreground">
                        {image.width}×{image.height}px ·{" "}
                        {image.whiteBackground ? "White BG ✓" : "Non-white BG ✗"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(image.id)}
                    >
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {compliance && (
              <div className="space-y-1 text-xs">
                {compliance.checks
                  .filter((c) => c.id.startsWith("image"))
                  .map((check) => (
                    <p
                      key={check.id}
                      className={cn(
                        check.status === "pass" && "text-green-700",
                        check.status === "warn" && "text-yellow-700",
                        check.status === "fail" && "text-red-700"
                      )}
                    >
                      {check.status === "pass" ? "✓" : "✗"} {check.message}
                    </p>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {step === 4 && draft && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4 — Pricing</CardTitle>
            <CardDescription>
              Valid range from synthetic government comparables.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Market range:{" "}
              <strong>
                ₹{draft.priceRange.min.toLocaleString("en-IN")} – ₹
                {draft.priceRange.max.toLocaleString("en-IN")}
              </strong>{" "}
              per unit
            </p>
            <div className="space-y-2">
              <Label htmlFor="unitPrice">Your unit price (₹)</Label>
              <Input
                id="unitPrice"
                type="number"
                min={1}
                value={unitPrice}
                onChange={(event) => setUnitPrice(event.target.value)}
                placeholder={String(Math.round((draft.priceRange.min + draft.priceRange.max) / 2))}
              />
            </div>
            {compliance && (
              <p
                className={cn(
                  "text-sm",
                  compliance.checks.find((c) => c.id === "price_range")?.status === "pass"
                    ? "text-green-700"
                    : "text-amber-700"
                )}
              >
                {compliance.checks.find((c) => c.id === "price_range")?.message}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {step === 5 && compliance && draft && (
        <Card className="print-content print-expand">
          <CardHeader>
            <CardTitle>Step 5 — Compliance review</CardTitle>
            <CardDescription>Final checklist before listing on GeM.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={cn(
                "rounded-lg border p-4 text-center",
                compliance.readyToList
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
                  : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
              )}
            >
              <p className="text-3xl font-bold">{compliance.score}%</p>
              <p className="mt-1 text-sm font-medium">
                {compliance.readyToList ? "Ready to List" : "Fix Issues"}
              </p>
            </div>

            <ul className="space-y-2">
              {compliance.checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2 text-sm">
                  <StepIcon status={check.status} />
                  <div>
                    <p className="font-medium">{check.label}</p>
                    <p className="text-muted-foreground">{check.message}</p>
                  </div>
                </li>
              ))}
            </ul>

            {compliance.blockers.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
                <p className="text-sm font-medium text-red-900 dark:text-red-200">
                  Blockers to fix:
                </p>
                <ul className="mt-1 space-y-1 text-sm text-red-800 dark:text-red-300">
                  {compliance.blockers.map((blocker) => (
                    <li key={blocker.code}>• {blocker.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              This generates draft data. Final submission happens on gem.gov.in
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((current) => Math.max(1, current - 1))}
          disabled={step === 1}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        {step < 5 ? (
          <Button
            type="button"
            onClick={() => setStep((current) => Math.min(5, current + 1))}
            disabled={!canGoNext()}
          >
            Next
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

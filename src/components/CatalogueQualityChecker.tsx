"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ImagePlus,
  XCircle,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CatalogueImage, getAllCategories } from "@/lib/rules/catalogue";
import {
  CatalogueProduct,
  getCommonRejections,
  listCategoryOptions,
  validateBIS,
  validateCategory,
  validateComplete,
  validateGoldenParameters,
  validateImages,
  validatePrice,
} from "@/lib/rules/catalogue-validator";
import { cn } from "@/lib/utils";

function StatusIcon({ ok }: { ok: boolean | null }) {
  if (ok === null) return null;
  return ok ? (
    <CheckCircle2 className="size-4 shrink-0 text-green-600" aria-hidden="true" />
  ) : (
    <XCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
  );
}

function loadImageMeta(file: File): Promise<CatalogueImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        whiteBackground: false,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

const CATEGORY_OPTIONS = listCategoryOptions();

export function CatalogueQualityChecker() {
  const [productName, setProductName] = useState("Revolving Executive Chair");
  const [categoryId, setCategoryId] = useState("office-chair");
  const [goldenParameters, setGoldenParameters] = useState<Record<string, string>>({
    WeightCapacity: "110kg",
    Swivel: "360°",
  });
  const [pricePerUnit, setPricePerUnit] = useState("5500");
  const [quantity, setQuantity] = useState("50");
  const [bisCertNumber, setBisCertNumber] = useState("");
  const [modelNumber, setModelNumber] = useState("REV-EXEC-01");
  const [images, setImages] = useState<CatalogueImage[]>([
    {
      id: "demo-1",
      name: "chair-front.jpg",
      width: 600,
      height: 400,
      whiteBackground: false,
    },
  ]);

  const selectedCategory = useMemo(
    () => getAllCategories().find((category) => category.id === categoryId) ?? null,
    [categoryId]
  );

  const categoryPath = selectedCategory?.categoryPath ?? [];

  const product: CatalogueProduct = useMemo(
    () => ({
      name: productName,
      categoryPath,
      categoryId,
      goldenParameters,
      pricePerUnit: Number.parseFloat(pricePerUnit) || 0,
      quantity: Number.parseInt(quantity, 10) || 0,
      bisCertNumber,
      modelNumber,
      images,
    }),
    [
      productName,
      categoryPath,
      categoryId,
      goldenParameters,
      pricePerUnit,
      quantity,
      bisCertNumber,
      modelNumber,
      images,
    ]
  );

  const categoryCheck = useMemo(() => validateCategory(product), [product]);
  const paramsCheck = useMemo(
    () => validateGoldenParameters(selectedCategory, goldenParameters),
    [selectedCategory, goldenParameters]
  );
  const imageCheck = useMemo(() => validateImages(images), [images]);
  const priceCheck = useMemo(
    () => validatePrice(product.pricePerUnit, selectedCategory, product.quantity),
    [product.pricePerUnit, product.quantity, selectedCategory]
  );
  const bisCheck = useMemo(
    () => validateBIS(product, bisCertNumber, selectedCategory),
    [product, bisCertNumber, selectedCategory]
  );
  const complete = useMemo(() => validateComplete(product), [product]);
  const rejections = useMemo(
    () => getCommonRejections(selectedCategory),
    [selectedCategory]
  );

  const handleCategoryChange = useCallback((nextId: string) => {
    setCategoryId(nextId);
    const category = getAllCategories().find((item) => item.id === nextId);
    if (category) {
      setGoldenParameters((current) => {
        const next: Record<string, string> = {};
        for (const key of Object.keys(category.goldenParameters)) {
          next[key] = current[key] ?? "";
        }
        return next;
      });
    }
  }, []);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files?.length) return;
      const loaded = await Promise.all(Array.from(files).map(loadImageMeta));
      setImages((current) => [...current, ...loaded]);
      event.target.value = "";
    },
    []
  );

  const scoreColor =
    complete.readiness === "ready"
      ? "text-green-700 dark:text-green-400"
      : complete.readiness === "fix"
        ? "text-amber-700 dark:text-amber-400"
        : "text-destructive";

  const scoreBg =
    complete.readiness === "ready"
      ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
      : complete.readiness === "fix"
        ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30"
        : "border-destructive/30 bg-destructive/10";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product details</CardTitle>
          <CardDescription>Validation updates in real time as you fill the form</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="product-name">Product name</Label>
            <Input
              id="product-name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Revolving Executive Chair"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Category path</Label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-medium">Golden parameters</p>
              {Object.keys(selectedCategory.goldenParameters).map((key) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`param-${key}`} className="text-xs">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <Input
                    id={`param-${key}`}
                    value={goldenParameters[key] ?? ""}
                    placeholder={
                      (selectedCategory.goldenParameters as unknown as Record<string, string>)[
                        key
                      ] ?? ""
                    }
                    onChange={(e) =>
                      setGoldenParameters((current) => ({
                        ...current,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price per unit (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bis">BIS certificate number</Label>
              <Input
                id="bis"
                value={bisCertNumber}
                onChange={(e) => setBisCertNumber(e.target.value)}
                placeholder="If applicable"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model number</Label>
              <Input
                id="model"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Product images</Label>
            <div className="flex flex-wrap gap-2">
              <label
                htmlFor="images"
                className={buttonVariants({ variant: "outline", size: "sm", className: "cursor-pointer" })}
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                Upload images
              </label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleImageUpload}
              />
              {images.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setImages([])}
                >
                  Clear all
                </Button>
              )}
            </div>
            {images.length > 0 && (
              <ul className="text-xs text-muted-foreground">
                {images.map((image) => (
                  <li key={image.id}>
                    {image.name}: {image.width}×{image.height}px
                    {image.whiteBackground ? " · white bg" : " · non-white bg"}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <div className={cn("rounded-xl border p-4 text-center", scoreBg)}>
        <p className="text-sm text-muted-foreground">Overall catalogue score</p>
        <p className={cn("text-4xl font-bold", scoreColor)}>{complete.score}/100</p>
        <p className={cn("mt-1 text-sm font-medium", scoreColor)}>{complete.readinessLabel}</p>
      </div>

      <div className="space-y-3">
        <ValidationRow
          title="Category check"
          ok={categoryCheck.valid}
          message={categoryCheck.message}
        />
        <ValidationRow
          title="Golden parameters"
          ok={paramsCheck.complete}
          message={paramsCheck.message}
        />
        <ValidationRow title="Image check" ok={imageCheck.compliant} message={imageCheck.message} />
        <ValidationRow
          title="Price check"
          ok={priceCheck.reasonable}
          message={priceCheck.message}
        />
        <ValidationRow
          title="BIS check"
          ok={!bisCheck.required || (bisCheck.present && bisCheck.correctModel)}
          message={bisCheck.message}
        />
      </div>

      {priceCheck.comparables.length > 0 && (
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-base">Market comparables</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {priceCheck.comparables.map((item) => (
                <li key={item.title}>
                  {item.title}: ₹{item.price.toLocaleString("en-IN")} — {item.department}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Common rejections for this category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rejections.map((item) => (
            <div key={item.reason} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{item.reason}</p>
              <p className="mt-1 text-muted-foreground">{item.howToFix}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Link
        href="/catalogue"
        className={buttonVariants({ size: "lg", className: "h-11 w-full sm:w-auto" })}
      >
        Go to Catalogue Builder
      </Link>
    </div>
  );
}

function ValidationRow({
  title,
  ok,
  message,
}: {
  title: string;
  ok: boolean;
  message: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 text-sm">
      <StatusIcon ok={ok} />
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

import Link from "next/link";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  FileWarning,
  Package,
  Phone,
} from "lucide-react";

import { DeliveryBufferCalculator, PODComparisonVisual } from "@/components/DeliveryGuide";
import { Disclaimer } from "@/components/Disclaimer";
import { PageShell } from "@/components/PageShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCommonPODMistakes,
  getPODChecklist,
  getPhotoChecklist,
} from "@/lib/rules/delivery";

export default function DeliveryPage() {
  const pod = getPODChecklist();
  const photos = getPhotoChecklist();
  const mistakes = getCommonPODMistakes();

  return (
    <PageShell className="space-y-8">
      <section className="space-y-3 text-center sm:text-left">
        <p className="text-sm font-medium text-primary">Delivery Guide</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Delivery — don&apos;t let payment fail at the last mile
        </h1>
        <p className="text-muted-foreground">
          You won the bid. Now get paid. POD and photo evidence are the difference between
          CRAC in 3 days and payment stuck for months.
        </p>
      </section>

      <Card id="pod">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileWarning className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Proof of Delivery (POD) — MANDATORY</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            No POD = No CRAC = No payment
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Required elements</p>
            <ul className="space-y-2">
              {pod.required.map((item) => (
                <li key={item.item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2
                    className="mt-0.5 size-4 shrink-0 text-green-600"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium">{item.item}</p>
                    <p className="text-muted-foreground">{item.description}</p>
                    <p className="text-xs text-muted-foreground">Why: {item.why}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Recommended</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {pod.recommended.map((item) => (
                <li key={item.item}>• {item.item} — {item.why}</li>
              ))}
            </ul>
          </div>

          <PODComparisonVisual />
        </CardContent>
      </Card>

      <Card id="photos">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Camera className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Photo evidence — take these</CardTitle>
          </div>
          <CardDescription>
            If buyer claims non-delivery, photos are your proof
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {photos.map((item) => (
              <li key={item.what} className="rounded-lg border p-3 text-sm">
                <p className="font-medium">{item.what}</p>
                <p className="text-muted-foreground">{item.why}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card id="timeline">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Delivery timeline calculator</CardTitle>
          </div>
          <CardDescription>Plan dispatch with transit buffer for government sites</CardDescription>
        </CardHeader>
        <CardContent>
          <DeliveryBufferCalculator />
        </CardContent>
      </Card>

      <Card id="mistakes">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>Common delivery mistakes</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {mistakes.map((item) => (
            <div key={item.mistake} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">{item.mistake}</p>
              <p className="mt-1 text-destructive">Consequence: {item.consequence}</p>
              <p className="mt-1 text-muted-foreground">Prevention: {item.prevention}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card id="rejected">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Phone className="size-5 text-primary" aria-hidden="true" />
            <CardTitle>What to do if delivery is rejected</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              Don&apos;t panic — document everything before leaving the site
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              Record the rejection reason in writing (photo of any note or email)
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              Contact GeM support and raise an incident with delivery proof attached
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">4.</span>
              Do NOT leave goods without confirmation — take goods back if acceptance is refused
            </li>
          </ol>
        </CardContent>
      </Card>

      <Link
        href="/orders"
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/80 sm:w-auto"
      >
        Track your orders
      </Link>

      <Disclaimer />
    </PageShell>
  );
}

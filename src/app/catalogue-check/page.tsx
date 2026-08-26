import { Disclaimer } from "@/components/Disclaimer";
import { CatalogueQualityChecker } from "@/components/CatalogueQualityChecker";
import { PageShell } from "@/components/PageShell";

export default function CatalogueCheckPage() {
  return (
    <PageShell className="space-y-6">
      <section className="space-y-2">
        <p className="text-sm font-medium text-primary">Catalogue Quality Checker</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Check your listing BEFORE submitting to GeM
        </h1>
        <p className="text-sm text-muted-foreground">
          33% of first-time catalogue submissions are rejected. Catch category, image, pricing,
          and BIS issues before GeM does.
        </p>
      </section>

      <CatalogueQualityChecker />

      <Disclaimer />
    </PageShell>
  );
}

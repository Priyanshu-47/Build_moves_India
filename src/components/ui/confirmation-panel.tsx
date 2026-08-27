import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmationSummaryItem = {
  label: string;
  value: string;
};

export type ConfirmationAction = {
  label: string;
  action?: string;
  onClick?: () => void;
  variant?: "default" | "outline";
  external?: boolean;
};

type ConfirmationPanelProps = {
  title: string;
  summary: ConfirmationSummaryItem[];
  whatNext: string[];
  actions: ConfirmationAction[];
  className?: string;
};

export function ConfirmationPanel({
  title,
  summary,
  whatNext,
  actions,
  className,
}: ConfirmationPanelProps) {
  return (
    <div
      id="confirmation-panel"
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className={cn(
        "rounded-lg border border-l-4 border-l-green-600 bg-green-50/50 p-6 dark:bg-green-950/20",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <CheckCircle2
          className="mt-0.5 size-6 shrink-0 text-green-600"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 space-y-5">
          <h2 className="text-lg font-semibold text-green-900 dark:text-green-100">
            {title}
          </h2>

          {summary.length > 0 && (
            <dl className="overflow-hidden rounded-lg border bg-background text-sm">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-x-4 border-b px-4 py-2.5 last:border-b-0 sm:grid-cols-[10rem_1fr]"
                >
                  <dt className="font-medium text-muted-foreground">{item.label}</dt>
                  <dd className="font-medium">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {whatNext.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold">What happens next</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {whatNext.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {actions.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {actions.map((item) => {
                if (item.onClick) {
                  return (
                    <Button
                      key={item.label}
                      type="button"
                      variant={item.variant ?? "default"}
                      onClick={item.onClick}
                    >
                      {item.label}
                    </Button>
                  );
                }

                if (item.external && item.action) {
                  return (
                    <a
                      key={item.label}
                      href={item.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: item.variant ?? "default" })}
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.action ?? "#"}
                    className={buttonVariants({ variant: item.variant ?? "default" })}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

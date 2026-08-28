import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PageHeaderAction = {
  label: string;
  icon?: LucideIcon;
  action?: string;
  onClick?: () => void;
  variant?: "default" | "outline";
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backUrl?: string;
  actions?: PageHeaderAction[];
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  backUrl,
  actions = [],
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-14 z-10 -mx-4 mb-6 border-b border-primary/10 bg-background/90 px-4 py-5 backdrop-blur-md md:-mx-6 md:px-6 lg:top-14 lg:-mx-10 lg:px-10",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {backUrl && (
            <Link
              href={backUrl}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "min-h-10 shrink-0 gap-1.5 border-primary/15"
              )}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span>Back</span>
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions.length > 0 && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            {actions.map((item) => {
              const Icon = item.icon;
              if (item.onClick) {
                return (
                  <Button
                    key={item.label}
                    type="button"
                    size="sm"
                    variant={item.variant ?? "default"}
                    onClick={item.onClick}
                    className="min-h-10 gap-1.5"
                  >
                    {Icon && <Icon className="size-4" aria-hidden="true" />}
                    {item.label}
                  </Button>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.action ?? "#"}
                  className={buttonVariants({
                    variant: item.variant ?? "default",
                    size: "sm",
                    className: "min-h-10 gap-1.5",
                  })}
                >
                  {Icon && <Icon className="size-4" aria-hidden="true" />}
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}

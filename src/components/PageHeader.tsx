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
        "sticky top-14 z-10 -mx-6 mb-6 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:-mx-12 md:px-12 lg:top-28 lg:-mx-16 lg:px-16",
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
                "shrink-0 gap-1.5 lg:h-8 lg:px-2.5 lg:text-xs"
              )}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              <span>Back</span>
            </Link>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground md:text-base">{subtitle}</p>
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
                    className="gap-1.5"
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
                    className: "gap-1.5",
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

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EmptyStateAction = {
  label: string;
  action?: string;
  onClick?: () => void;
  variant?: "default" | "outline";
};

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actions?: EmptyStateAction[];
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actions = [],
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-dashed px-6 py-10 text-center",
        className
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon className="size-7 text-muted-foreground" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actions.length > 0 && (
        <div className="mt-6 w-full max-w-md space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            What you can do next
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            {actions.map((item) =>
              item.onClick ? (
                <Button
                  key={item.label}
                  type="button"
                  variant={item.variant ?? "default"}
                  size="sm"
                  onClick={item.onClick}
                >
                  {item.label}
                </Button>
              ) : (
                <Link
                  key={item.label}
                  href={item.action ?? "#"}
                  className={buttonVariants({
                    variant: item.variant ?? "default",
                    size: "sm",
                  })}
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

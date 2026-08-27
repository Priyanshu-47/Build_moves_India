"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterGroup = {
  key: string;
  label: string;
  options: FilterOption[];
};

export type ActiveFilters = Record<string, string[]>;

type FilterChipsProps = {
  filters: FilterGroup[];
  activeFilters: ActiveFilters;
  onFilterChange: (key: string, value: string) => void;
  onClearFilter?: (key: string, value: string) => void;
  className?: string;
};

export function FilterChips({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilter,
  className,
}: FilterChipsProps) {
  const activeEntries = Object.entries(activeFilters).flatMap(([key, values]) =>
    values.map((value) => {
      const group = filters.find((filter) => filter.key === key);
      const option = group?.options.find((item) => item.value === value);
      return { key, value, label: option?.label ?? value };
    })
  );

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
        {filters.map((group) => (
          <div key={group.key} className="flex shrink-0 items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">{group.label}:</span>
            {group.options.map((option) => {
              const active = activeFilters[group.key]?.includes(option.value) ?? false;
              return (
                <button
                  key={`${group.key}-${option.value}`}
                  type="button"
                  onClick={() => onFilterChange(group.key, option.value)}
                  className={cn(
                    "shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input bg-background hover:bg-muted"
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {activeEntries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeEntries.map(({ key, value, label }) => (
            <Badge key={`${key}-${value}`} variant="secondary" className="gap-1 pr-1">
              {label}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label={`Remove ${label} filter`}
                onClick={() => (onClearFilter ?? onFilterChange)(key, value)}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

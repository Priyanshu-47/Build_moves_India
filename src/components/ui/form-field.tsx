import type { ReactElement, ReactNode } from "react";
import { cloneElement, isValidElement } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
  className,
}: FormFieldProps) {
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = fieldDescribedBy(htmlFor, error, hint);

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string; "aria-describedby"?: string }>, {
        id: htmlFor,
        "aria-describedby": describedBy,
      })
    : children;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            {" "}
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </Label>
      {control}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function fieldDescribedBy(htmlFor: string, error?: string, hint?: string): string | undefined {
  const ids: string[] = [];
  if (hint && !error) ids.push(`${htmlFor}-hint`);
  if (error) ids.push(`${htmlFor}-error`);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

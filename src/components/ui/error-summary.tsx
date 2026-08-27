type FieldError = {
  field: string;
  message: string;
};

type ErrorSummaryProps = {
  errors: FieldError[];
  title?: string;
};

export function ErrorSummary({
  errors,
  title = "There is a problem",
}: ErrorSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div
      id="error-summary"
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      className="rounded-lg border-2 border-destructive bg-destructive/5 p-4"
    >
      <h2 id="error-summary-title" className="text-base font-semibold text-destructive">
        {title}
      </h2>
      <ul className="mt-2 list-none space-y-1 text-sm">
        {errors.map((error) => (
          <li key={error.field}>
            <a
              href={`#${error.field}`}
              className="font-medium text-destructive underline underline-offset-2 hover:no-underline"
              onClick={(event) => {
                event.preventDefault();
                const element = document.getElementById(error.field);
                element?.focus();
                element?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

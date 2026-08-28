import { cn } from "@/lib/utils";

type BentoPageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  variant?: "default" | "gradient";
  children?: React.ReactNode;
};

export function BentoPageHeader({
  eyebrow,
  title,
  subtitle,
  className,
  variant = "default",
  children,
}: BentoPageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 md:p-8 md:col-span-12",
        variant === "gradient"
          ? "gradient-hero text-white shadow-xl"
          : "border bg-card shadow-sm",
        className
      )}
    >
      {variant === "gradient" && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(96,165,250,0.25)_0%,_transparent_55%)]" />
      )}
      <div className="relative space-y-2">
        {eyebrow && (
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-widest",
              variant === "gradient" ? "text-blue-200" : "text-primary"
            )}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl",
            variant === "gradient" && "text-white"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "max-w-2xl text-sm leading-relaxed md:text-base",
              variant === "gradient" ? "text-blue-100/90" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </p>
        )}
        {children && <div className="flex flex-wrap gap-2 pt-3">{children}</div>}
      </div>
    </section>
  );
}

export function BentoStatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const tones = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    danger: "bg-destructive/15 text-destructive",
  };

  return (
    <div className={cn("rounded-2xl px-4 py-2.5", tones[tone])}>
      <p className="text-lg font-bold tabular-nums leading-none">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
    </div>
  );
}

export function BentoTile({
  children,
  className,
  colSpan = 12,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
  id?: string;
}) {
  const spanClass = {
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
    7: "md:col-span-7",
    8: "md:col-span-8",
    12: "md:col-span-12",
  }[colSpan];

  return (
    <div
      id={id}
      className={cn(
        "rounded-3xl border bg-card p-5 shadow-sm md:p-6",
        spanClass,
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </h2>
  );
}

import { cn } from "@/lib/utils";

type CircularProgressProps = {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  /** Use lighter track + white value text for dark backgrounds */
  onDark?: boolean;
  /** Show "84%" instead of "84 / 100" */
  variant?: "fraction" | "percent";
};

function scoreColor(score: number, onDark?: boolean): string {
  if (onDark) {
    if (score > 80) return "#86efac";
    if (score >= 60) return "#fde047";
    return "#fca5a5";
  }
  if (score > 80) return "#16a34a";
  if (score >= 60) return "#ca8a04";
  return "#dc2626";
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  className,
  onDark = false,
  variant = "fraction",
}: CircularProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;
  const center = size / 2;
  const stroke = scoreColor(percent, onDark);
  const valueSize =
    variant === "percent"
      ? size < 90
        ? "text-base"
        : size < 110
          ? "text-xl"
          : "text-2xl"
      : size < 90
        ? "text-lg"
        : size < 110
          ? "text-2xl"
          : "text-3xl";

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(percent)} out of ${max}${label ? ` ${label}` : ""}`}
    >
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={onDark ? "rgba(255,255,255,0.2)" : "currentColor"}
          strokeWidth={strokeWidth}
          className={onDark ? undefined : "text-muted/30"}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span
          className={cn(
            "font-bold tabular-nums tracking-tight",
            valueSize,
            onDark ? "text-white" : "text-foreground"
          )}
        >
          {variant === "percent" ? `${Math.round(percent)}%` : value}
        </span>
        {variant === "fraction" && (
          <span
            className={cn(
              "mt-0.5 text-[10px]",
              onDark ? "text-blue-100/80" : "text-muted-foreground"
            )}
          >
            / {max}
          </span>
        )}
        {variant === "percent" && label && (
          <span
            className={cn(
              "mt-0.5 text-[9px] font-semibold uppercase tracking-wide",
              onDark ? "text-blue-100/70" : "text-muted-foreground"
            )}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

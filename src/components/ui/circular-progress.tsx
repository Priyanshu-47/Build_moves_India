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
}: CircularProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;
  const center = size / 2;
  const stroke = scoreColor(percent, onDark);
  const valueSize = size < 90 ? "text-lg" : size < 110 ? "text-2xl" : "text-3xl";

  return (
    <div
      className={cn("relative inline-flex flex-col items-center", className)}
      role="img"
      aria-label={`${Math.round(percent)} out of ${max}${label ? ` ${label}` : ""}`}
    >
      <svg width={size} height={size} className="-rotate-90">
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-bold tabular-nums",
            valueSize,
            onDark ? "text-white" : "text-foreground"
          )}
        >
          {value}
        </span>
        <span
          className={cn(
            "text-[10px]",
            onDark ? "text-blue-100/80" : "text-muted-foreground"
          )}
        >
          / {max}
        </span>
      </div>
    </div>
  );
}

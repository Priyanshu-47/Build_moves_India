import { cn } from "@/lib/utils";

type SparklineProps = {
  data?: number[];
  trend?: "up" | "down";
  className?: string;
};

const DEFAULT_UP = [20, 35, 28, 42, 55];
const DEFAULT_DOWN = [55, 42, 48, 35, 28];

export function Sparkline({ data, trend = "up", className }: SparklineProps) {
  const points = data ?? (trend === "up" ? DEFAULT_UP : DEFAULT_DOWN);
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 64;
  const height = 24;
  const step = width / (points.length - 1);

  const pathD = points
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const color = trend === "up" ? "#16a34a" : "#dc2626";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-6 w-16", className)}
      aria-hidden="true"
    >
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

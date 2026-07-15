export interface ProgressBarProps {
  value: number; // 0-100
  color?: "gold" | "bronze" | "teal" | "danger";
  label?: string;
  showPercent?: boolean;
  height?: "sm" | "md";
}

const COLOR_MAP: Record<NonNullable<ProgressBarProps["color"]>, string> = {
  gold: "bg-gradient-to-r from-gold-600 to-gold-400",
  bronze: "bg-gradient-to-r from-bronze-700 to-bronze-400",
  teal: "bg-gradient-to-r from-teal-600 to-teal-400",
  danger: "bg-gradient-to-r from-red-700 to-red-500",
};

export function ProgressBar({ value, color = "gold", label, showPercent = false, height = "md" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const trackHeight = height === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="mb-1 flex items-center justify-between text-xs text-sand-300">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-semibold text-sand-100">{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={`w-full rounded-full bg-stone-800/80 ${trackHeight} overflow-hidden`}>
        <div
          data-testid="progress-fill"
          className={`${trackHeight} rounded-full ${COLOR_MAP[color]} transition-[width] duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

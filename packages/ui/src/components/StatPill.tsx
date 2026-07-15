import type { ReactNode } from "react";

export interface StatPillProps {
  icon: ReactNode;
  value: ReactNode;
  suffix?: string;
  onAdd?: () => void;
  tone?: "energy" | "coins" | "gems" | "neutral";
}

const TONE_MAP: Record<NonNullable<StatPillProps["tone"]>, string> = {
  energy: "border-gold-500/40 text-gold-300",
  coins: "border-gold-400/40 text-gold-200",
  gems: "border-purple-400/40 text-purple-200",
  neutral: "border-stone-600/50 text-sand-100",
};

export function StatPill({ icon, value, suffix, onAdd, tone = "neutral" }: StatPillProps) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border bg-stone-900/70 px-3 py-1.5 ${TONE_MAP[tone]}`}>
      <span className="shrink-0">{icon}</span>
      <span className="text-sm font-semibold text-sand-50">
        {value}
        {suffix && <span className="ml-1 text-xs font-normal text-sand-400">{suffix}</span>}
      </span>
      {onAdd && (
        <button
          onClick={onAdd}
          aria-label="Add"
          className="ml-1 flex h-5 w-5 items-center justify-center rounded-md bg-teal-700/80 text-sand-50 hover:bg-teal-600"
        >
          +
        </button>
      )}
    </div>
  );
}

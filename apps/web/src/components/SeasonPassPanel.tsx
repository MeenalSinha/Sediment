import { Gift } from "lucide-react";
import { Button, ProgressBar } from "@sediment/ui";
import type { Season, SeasonPassProgress } from "@sediment/shared";

export interface SeasonPassPanelProps {
  season: Season;
  progress: SeasonPassProgress;
  onOpenPass: () => void;
}

function timeRemaining(endsAt: string): string {
  const diffMs = new Date(endsAt).getTime() - Date.now();
  const days = Math.max(0, Math.floor(diffMs / 86_400_000));
  const hours = Math.max(0, Math.floor((diffMs % 86_400_000) / 3_600_000));
  return `${days}d ${hours}h`;
}

export function SeasonPassPanel({ season, progress, onOpenPass }: SeasonPassPanelProps) {
  const tierXp = 400;
  const pctToNextTier = ((progress.xp % tierXp) / tierXp) * 100;

  return (
    <div className="rounded-xl border border-gold-600/40 bg-gradient-to-br from-purple-950/40 to-stone-900 p-4 shadow-panel">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-300">Season: {season.name}</p>
          <p className="text-xs text-sand-400">Ends in {timeRemaining(season.endsAt)}</p>
        </div>
        <Gift className="text-gold-400" size={26} />
      </div>

      <ProgressBar value={pctToNextTier} color="gold" label={`Tier ${progress.tier}`} />
      <p className="mt-1 text-[11px] text-sand-400">
        {progress.xp % tierXp} / {tierXp}
      </p>

      <Button variant="gold" size="sm" className="mt-3 w-full" onClick={onOpenPass}>
        Season Pass
      </Button>
    </div>
  );
}

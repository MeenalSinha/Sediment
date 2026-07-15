import { RefreshCcw, Gem, BarChart3, Trophy, Settings } from "lucide-react";
import { ProgressBar } from "@sediment/ui";
import type { CommunityEvent } from "@sediment/shared";

export interface BottomEventBarProps {
  globalEvent: CommunityEvent;
  communityGoalEvent: CommunityEvent;
  onOpenRankings: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
}

function timeRemaining(endsAt: string): string {
  const diffMs = new Date(endsAt).getTime() - Date.now();
  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

export function BottomEventBar({
  globalEvent,
  communityGoalEvent,
  onOpenRankings,
  onOpenAchievements,
  onOpenSettings,
}: BottomEventBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-stone-800 bg-stone-900/80 px-2 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
      <div className="hidden items-center gap-2 text-teal-400 md:flex">
        <RefreshCcw size={16} />
        <div className="text-xs">
          <div className="font-semibold text-sand-100">{globalEvent.title}</div>
          <div className="text-sand-500">Ends in {timeRemaining(globalEvent.endsAt)}</div>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-gold-600/40 bg-stone-950/60 px-3 py-1.5">
        <Gem size={16} className="shrink-0 text-gold-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-sand-100">{communityGoalEvent.title}</p>
          {communityGoalEvent.progress !== null && communityGoalEvent.goal !== null && (
            <ProgressBar
              value={(communityGoalEvent.progress / communityGoalEvent.goal) * 100}
              color="gold"
              height="sm"
            />
          )}
        </div>
        <span className="hidden shrink-0 text-xs text-sand-500 sm:inline">
          Ends in {timeRemaining(communityGoalEvent.endsAt)}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <IconButton icon={BarChart3} label="Rankings" onClick={onOpenRankings} />
        <IconButton icon={Trophy} label="Achievements" onClick={onOpenAchievements} />
        <IconButton icon={Settings} label="Settings" onClick={onOpenSettings} />
      </div>
    </div>
  );
}

function IconButton({ icon: Icon, label, onClick }: { icon: typeof BarChart3; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="flex items-center gap-1.5 rounded-lg border border-stone-700 px-2 py-1.5 text-xs font-medium text-sand-300 hover:bg-stone-800 sm:px-2.5"
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

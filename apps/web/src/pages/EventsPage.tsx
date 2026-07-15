import { CalendarDays, Trophy, Lock } from "lucide-react";
import { Panel, ProgressBar } from "@sediment/ui";
import { ACHIEVEMENTS } from "@sediment/shared";
import { demoCommunityGoalEvent, demoGlobalEvent } from "@/lib/mockData";
import { useSedimentStore } from "@/lib/store";

export function EventsPage() {
  const unlockedAchievements = useSedimentStore((s) => s.unlockedAchievements);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <Panel eyebrow="Active Events" title="Community Events">
        <div className="flex flex-col gap-3">
          {[demoGlobalEvent, demoCommunityGoalEvent].map((event) => (
            <div key={event.id} className="rounded-lg border border-stone-700/60 bg-stone-800/50 p-3">
              <div className="mb-1 flex items-center gap-2 text-sand-100">
                <CalendarDays size={16} className="text-teal-400" />
                <p className="text-sm font-semibold">{event.title}</p>
              </div>
              {event.description && <p className="mb-2 text-xs text-sand-400">{event.description}</p>}
              {event.progress !== null && event.goal !== null && (
                <ProgressBar value={(event.progress / event.goal) * 100} color="gold" showPercent />
              )}
            </div>
          ))}
        </div>
      </Panel>

      <Panel eyebrow="Achievements" title="Community Achievements" className="flex-1">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = unlockedAchievements.has(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 rounded-lg border p-3 ${
                  unlocked ? "border-gold-500/50 bg-gold-500/10" : "border-stone-700/50 bg-stone-800/40"
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${unlocked ? "bg-gold-500/20 text-gold-300" : "bg-stone-700/50 text-sand-500"}`}
                >
                  {unlocked ? <Trophy size={17} /> : <Lock size={15} />}
                </span>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${unlocked ? "text-sand-50" : "text-sand-400"}`}>
                    {achievement.name}
                  </p>
                  <p className="text-xs text-sand-500">{achievement.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

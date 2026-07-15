import { Trophy } from "lucide-react";
import { Modal } from "@/components/Modal";
import { ROLE_LABELS } from "@sediment/shared";
import type { LeaderboardEntry } from "@/lib/mockData";

export interface RankingsModalProps {
  open: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  currentUsername: string;
}

const MEDAL_COLORS = ["text-gold-300", "text-sand-300", "text-bronze-400"];

export function RankingsModal({ open, onClose, entries, currentUsername }: RankingsModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Community Rankings" width="md">
      <ul className="flex flex-col gap-1.5">
        {entries.map((entry) => {
          const isMe = entry.username === currentUsername;
          return (
            <li
              key={entry.rank}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ${isMe ? "border border-gold-500/50 bg-gold-500/10" : "border border-transparent"}`}
            >
              <span
                className={`w-6 text-center text-sm font-bold ${entry.rank <= 3 ? MEDAL_COLORS[entry.rank - 1] : "text-sand-500"}`}
              >
                {entry.rank <= 3 ? <Trophy size={16} className="mx-auto" /> : entry.rank}
              </span>
              <div className="h-8 w-8 shrink-0 rounded-full bg-stone-700" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-sand-100">
                  {entry.username} {isMe && <span className="text-xs text-gold-300">(you)</span>}
                </p>
                <p className="text-[11px] text-sand-500">
                  Lv. {entry.level} · {ROLE_LABELS[entry.role]}
                </p>
              </div>
              <span className="text-sm font-semibold text-sand-200">{entry.artifactsFound} found</span>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}

import { ArrowUp, MessageCircleOff } from "lucide-react";
import { Panel, Button } from "@sediment/ui";
import type { FeedItem } from "@sediment/shared";
import { ROLE_LABELS } from "@sediment/shared";

export interface LiveDiscussionsPanelProps {
  items: FeedItem[];
  onSeeAll: () => void;
  onAddLore: () => void;
}

export function LiveDiscussionsPanel({ items, onSeeAll, onAddLore }: LiveDiscussionsPanelProps) {
  return (
    <Panel
      eyebrow="Live Discussions"
      action={
        <button onClick={onSeeAll} className="text-xs font-semibold text-teal-400 hover:text-teal-300">
          See all
        </button>
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 py-6 text-center text-sand-500">
          <MessageCircleOff size={22} />
          <p className="text-xs">No discussion yet on this dig. Be the first to share a theory.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.slice(0, 3).map((item) => (
            <li
              key={item.id}
              className="flex items-start gap-2.5 border-b border-stone-800 pb-3 last:border-none last:pb-0"
            >
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-stone-700" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-sand-100">{item.username}</span>
                  <span className="text-sand-500">{ROLE_LABELS[item.role]}</span>
                  <span className="text-sand-600">{relativeTime(item.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-sm leading-snug text-sand-300">{item.body}</p>
              </div>
              <div className="flex shrink-0 flex-col items-center text-teal-400">
                <ArrowUp size={14} />
                <span className="text-xs font-semibold text-sand-200">{item.upvotes}</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button variant="gold" size="sm" className="mt-3 w-full" onClick={onAddLore}>
        Add Your Lore
      </Button>
    </Panel>
  );
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.max(1, Math.round(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  return `${hours}h ago`;
}

import { Users, Map, MessageCircle } from "lucide-react";
import { Panel, ProgressBar, Button } from "@sediment/ui";
import type { DigLayer } from "@sediment/shared";
import { useDigSiteGame } from "@/hooks/useDigSiteGame";
import { useSedimentStore } from "@/lib/store";

export interface DigSitePanelProps {
  layer: DigLayer;
  diggerCount: number;
  artifactImageUrl: string;
  onOpenMap: () => void;
  onOpenLiveFeed: () => void;
  activeDiggerAvatars: string[];
}

export function DigSitePanel({
  layer,
  diggerCount,
  artifactImageUrl,
  onOpenMap,
  onOpenLiveFeed,
  activeDiggerAvatars,
}: DigSitePanelProps) {
  const progressPercent = useSedimentStore((s) => s.progressPercent);
  const revealNextArtifact = useSedimentStore((s) => s.revealNextArtifact);
  const grantRoleXp = useSedimentStore((s) => s.grantRoleXp);
  const activeRole = useSedimentStore((s) => s.activeRole);
  const containerRef = useDigSiteGame({
    artifactImageUrl,
    onArtifactRevealed: () => {
      revealNextArtifact();
      grantRoleXp(activeRole, 60);
    },
  });

  return (
    <Panel className="flex-1">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-400/90">Today&rsquo;s Dig Site</p>
          <h2 className="text-xl font-bold text-sand-50">{layer.name}</h2>
          <p className="text-xs text-sand-400">Layer {layer.index} of 14</p>
        </div>

        <div className="flex items-center gap-2 text-sand-300">
          <Users size={16} />
          <div className="text-sm">
            <div className="font-semibold text-sand-50">{diggerCount.toLocaleString()}</div>
            <div className="text-[11px] text-sand-400">Diggers</div>
          </div>
        </div>

        <div className="min-w-[10rem]">
          <p className="text-[11px] text-sand-400">Layer Progress</p>
          <ProgressBar value={layer.progress} color="gold" />
        </div>

        <Button variant="secondary" size="sm" onClick={onOpenMap}>
          <span className="flex items-center gap-1.5">
            <Map size={14} /> View Map
          </span>
        </Button>
      </div>

      <div
        className="relative overflow-hidden rounded-lg border border-stone-700/60 bg-[#3b2c1c]"
        style={{ height: "min(420px, 55vh)" }}
      >
        <div ref={containerRef} className="absolute inset-0" />
        <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-stone-950/70 px-2 py-1 text-[11px] text-sand-300">
          Community clearing: {Math.round(progressPercent)}%
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex -space-x-2">
          {activeDiggerAvatars.slice(0, 9).map((src, i) => (
            <div key={i} className="h-8 w-8 overflow-hidden rounded-full border-2 border-stone-900 bg-stone-700">
              {src && <img src={src} alt="" className="h-full w-full object-cover" />}
            </div>
          ))}
          {diggerCount > 9 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-stone-900 bg-stone-800 text-[10px] font-semibold text-sand-300">
              +{diggerCount - 9}
            </div>
          )}
        </div>

        <Button variant="primary" size="sm" onClick={onOpenLiveFeed}>
          <span className="flex items-center gap-1.5">
            <MessageCircle size={14} /> Live Feed
          </span>
        </Button>
      </div>
    </Panel>
  );
}

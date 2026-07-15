import { X } from "lucide-react";
import { Panel, ProgressBar, Button } from "@sediment/ui";
import type { Artifact } from "@sediment/shared";

const RARITY_STYLES: Record<Artifact["rarity"], string> = {
  common: "bg-stone-700 text-sand-200",
  uncommon: "bg-teal-700 text-sand-50",
  rare: "bg-gold-700 text-gold-100",
  legendary: "bg-gradient-to-r from-purple-700 to-gold-600 text-sand-50",
};

export interface CurrentDiscoveryPanelProps {
  artifact: Artifact;
  onClose: () => void;
  onSendToRestoration: () => void;
  onViewDetails: () => void;
}

export function CurrentDiscoveryPanel({
  artifact,
  onClose,
  onSendToRestoration,
  onViewDetails,
}: CurrentDiscoveryPanelProps) {
  return (
    <Panel
      eyebrow="Current Discovery"
      accent="gold"
      action={
        <button
          onClick={onClose}
          aria-label="Dismiss"
          className="rounded-md p-1 text-sand-400 hover:bg-stone-800 hover:text-sand-100"
        >
          <X size={16} />
        </button>
      }
    >
      <h3 className="text-lg font-bold text-sand-50">{artifact.name}</h3>
      <span
        className={`mt-1 inline-block rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${RARITY_STYLES[artifact.rarity]}`}
      >
        {artifact.rarity}
      </span>

      <div className="my-3 aspect-[4/3] overflow-hidden rounded-lg border border-stone-700/60 bg-stone-800">
        {artifact.imageUrl && (
          <img src={artifact.imageUrl} alt={artifact.name} className="h-full w-full object-cover" />
        )}
      </div>

      <div className="mb-3">
        <ProgressBar
          value={artifact.condition}
          color={artifact.condition > 50 ? "teal" : "danger"}
          label="Condition"
          showPercent
        />
      </div>

      <dl className="mb-4 space-y-1.5 text-sm">
        <Row label="Material" value={artifact.material} />
        <Row label="Period" value={artifact.period} />
        <Row label="Found By" value={`${artifact.discoveredBy?.length ?? 0} diggers today`} />
      </dl>

      <div className="flex gap-2">
        <Button variant="gold" size="sm" className="flex-1" onClick={onSendToRestoration}>
          Send to Restoration
        </Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={onViewDetails}>
          View Details
        </Button>
      </div>
    </Panel>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[11px] uppercase tracking-wide text-sand-400">{label}</dt>
      <dd className="font-semibold text-sand-100">{value}</dd>
    </div>
  );
}

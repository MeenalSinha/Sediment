import { Amphora, Hammer, Gem as GemIcon, Swords, CircleDot, Shell, ScrollText, Skull } from "lucide-react";
import { Panel, Button } from "@sediment/ui";

export interface CollectionTally {
  category: string;
  icon: keyof typeof ICONS;
  discovered: number;
  total: number;
}

const ICONS = {
  pottery: Amphora,
  tools: Hammer,
  jewelry: GemIcon,
  weapons: Swords,
  relics: CircleDot,
  fossils: Shell,
  inscriptions: ScrollText,
  skeletal: Skull,
};

export interface MuseumCollectionBarProps {
  discovered: number;
  total: number;
  categories: CollectionTally[];
  onViewMuseum: () => void;
}

export function MuseumCollectionBar({ discovered, total, categories, onViewMuseum }: MuseumCollectionBarProps) {
  return (
    <Panel eyebrow="Museum Collection" className="flex-1">
      <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
        <div className="shrink-0">
          <p className="text-2xl font-bold text-sand-50">
            {discovered} <span className="text-base font-normal text-sand-500">/ {total}</span>
          </p>
          <p className="text-[11px] text-sand-400">Artifacts Discovered</p>
          <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={onViewMuseum}>
            View Museum
          </Button>
        </div>

        <div className="grid flex-1 grid-cols-4 gap-2 sm:grid-cols-8">
          {categories.map((cat) => {
            const Icon = ICONS[cat.icon];
            return (
              <div
                key={cat.category}
                className="flex flex-col items-center rounded-lg border border-stone-700/50 bg-stone-800/60 py-2.5"
              >
                <Icon size={20} className="text-bronze-400" strokeWidth={1.75} />
                <p className="mt-1 text-xs font-semibold text-sand-100">
                  {cat.discovered}/{cat.total}
                </p>
                <p className="text-[10px] capitalize text-sand-500">{cat.category}</p>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

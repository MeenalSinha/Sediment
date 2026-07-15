import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Panel, ProgressBar } from "@sediment/ui";
import { ArtifactDetailModal } from "@/components/ArtifactDetailModal";
import { useSedimentStore } from "@/lib/store";
import type { Artifact } from "@sediment/shared";

const RARITY_BORDER: Record<Artifact["rarity"], string> = {
  common: "border-stone-600",
  uncommon: "border-teal-600",
  rare: "border-gold-600",
  legendary: "border-purple-500",
};

export function MuseumPage() {
  const artifacts = useSedimentStore((s) => s.artifacts);
  const loreByArtifact = useSedimentStore((s) => s.loreByArtifact);
  const addLore = useSedimentStore((s) => s.addLore);
  const voteLore = useSedimentStore((s) => s.voteLore);
  const user = useSedimentStore((s) => s.user);
  const reducedMotion = useSedimentStore((s) => s.settings.reducedMotion);
  const unlockAchievement = useSedimentStore((s) => s.unlockAchievement);

  const [selected, setSelected] = useState<Artifact | null>(null);

  useEffect(() => {
    unlockAchievement("museum_founder");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <Panel eyebrow="Persistent Museum" title="The Sun Priests of Kalveth Collection">
        <p className="text-sm text-sand-400">
          Every artifact excavated by this community lives here forever — condition, discoverers, and community lore
          included.
        </p>
      </Panel>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {artifacts.map((artifact, i) => (
          <motion.button
            key={artifact.id}
            onClick={() => setSelected(artifact)}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: reducedMotion ? 0 : i * 0.03 }}
            className={`flex flex-col rounded-xl border bg-stone-900/70 p-3 text-left shadow-panel transition-transform hover:-translate-y-0.5 ${RARITY_BORDER[artifact.rarity]}`}
          >
            <div className="mb-2 flex aspect-square items-center justify-center rounded-lg bg-gradient-to-br from-bronze-500/40 to-stone-800 text-xs font-semibold uppercase text-sand-300">
              {artifact.category}
            </div>
            <p className="truncate text-sm font-bold text-sand-50">{artifact.name}</p>
            <p className="mb-1.5 text-[11px] capitalize text-sand-500">
              {artifact.rarity} · {artifact.status.replace("_", " ")}
            </p>
            <ProgressBar value={artifact.condition} color={artifact.condition > 50 ? "teal" : "danger"} height="sm" />
          </motion.button>
        ))}
      </div>

      <ArtifactDetailModal
        open={!!selected}
        onClose={() => setSelected(null)}
        artifact={selected}
        lore={selected ? (loreByArtifact[selected.id] ?? []) : []}
        onVote={(loreId) => selected && voteLore(selected.id, loreId)}
        onSubmitLore={(body) => selected && addLore(selected.id, user?.redditUsername ?? "You", body)}
      />
    </div>
  );
}

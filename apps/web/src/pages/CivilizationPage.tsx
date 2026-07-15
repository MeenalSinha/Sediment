import { motion } from "framer-motion";
import { Landmark, Swords, Sun, Waves, Search } from "lucide-react";
import { Panel } from "@sediment/ui";
import { demoCivilizationName, demoCivilizationOriginStory, demoTimeline } from "@/lib/mockData";
import { useSedimentStore } from "@/lib/store";
import type { CivilizationTimelineEvent } from "@sediment/shared";

const ERA_ICON: Record<CivilizationTimelineEvent["era"], typeof Landmark> = {
  founding: Landmark,
  war: Swords,
  golden_age: Sun,
  collapse: Waves,
  rediscovery: Search,
};

const ERA_COLOR: Record<CivilizationTimelineEvent["era"], string> = {
  founding: "text-teal-400 border-teal-500/50",
  war: "text-red-400 border-red-500/50",
  golden_age: "text-gold-300 border-gold-500/50",
  collapse: "text-sand-400 border-sand-500/50",
  rediscovery: "text-purple-300 border-purple-500/50",
};

export function CivilizationPage() {
  const reducedMotion = useSedimentStore((s) => s.settings.reducedMotion);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <Panel eyebrow="This Subreddit's Civilization" title={demoCivilizationName}>
        <p className="text-sm leading-relaxed text-sand-400">{demoCivilizationOriginStory}</p>
        <p className="mt-2 text-[11px] text-sand-600">
          Generated once for this subreddit and season — every community excavates a civilization that has never existed
          anywhere else.
        </p>
      </Panel>

      <Panel eyebrow="Timeline" className="flex-1">
        <div className="relative ml-4 flex flex-col gap-6 border-l border-stone-700/60 pl-6">
          {demoTimeline.map((event, i) => {
            const Icon = ERA_ICON[event.era];
            return (
              <motion.div
                key={event.id}
                initial={reducedMotion ? false : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: reducedMotion ? 0 : i * 0.08 }}
                className="relative"
              >
                <span
                  className={`absolute -left-[34px] flex h-8 w-8 items-center justify-center rounded-full border-2 bg-stone-900 ${ERA_COLOR[event.era]}`}
                >
                  <Icon size={15} />
                </span>
                <p className="text-[11px] uppercase tracking-widest text-sand-500">Year {event.year}</p>
                <h3 className="text-base font-bold text-sand-50">{event.title}</h3>
                <p className="text-sm text-sand-400">{event.description}</p>
              </motion.div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

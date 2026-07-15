import { Paintbrush, Pickaxe, PenTool, Wind, Droplets, Zap } from "lucide-react";
import { Panel, ProgressBar } from "@sediment/ui";
import type { ToolId } from "@sediment/shared";
import { useSedimentStore } from "@/lib/store";
import { Tooltip } from "@/components/Tooltip";

function formatCountdown(iso: string | null): string {
  if (!iso) return "—";
  const diffMs = new Date(iso).getTime() - Date.now();
  if (diffMs <= 0) return "now";
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

const TOOLS: { id: ToolId; label: string; sub: string; icon: typeof Paintbrush; tooltip: string }[] = [
  {
    id: "brush",
    label: "Brush",
    sub: "Safe",
    icon: Paintbrush,
    tooltip: "Safe and slow. Very low risk of damage — best default choice.",
  },
  {
    id: "pickaxe",
    label: "Pickaxe",
    sub: "Risky",
    icon: Pickaxe,
    tooltip: "Fast clearing, but the highest damage risk of any tool. Use away from fragile finds.",
  },
  {
    id: "fine_brush",
    label: "Fine Brush",
    sub: "Fragile",
    icon: PenTool,
    tooltip: "Slow and precise — the safest tool for fragile fossils and cracked artifacts.",
  },
  {
    id: "air_blower",
    label: "Air Blower",
    sub: "Loose Dust",
    icon: Wind,
    tooltip: "Clears loose dust quickly with zero damage risk, but reveals no inscriptions.",
  },
  {
    id: "water_spray",
    label: "Water Spray",
    sub: "Reveal Text",
    icon: Droplets,
    tooltip: "The only tool that reveals faded inscriptions as it cleans.",
  },
];

export function ToolsPanel() {
  const activeTool = useSedimentStore((s) => s.activeTool);
  const setActiveTool = useSedimentStore((s) => s.setActiveTool);
  const toolDurability = useSedimentStore((s) => s.toolDurability);
  const user = useSedimentStore((s) => s.user);

  return (
    <div className="flex flex-col gap-4 lg:w-64">
      <Panel eyebrow="Tools">
        <div className="flex flex-col gap-1.5">
          {TOOLS.map(({ id, label, sub, icon: Icon, tooltip }) => {
            const isActive = activeTool === id;
            return (
              <Tooltip key={id} label={tooltip} side="right">
                <button
                  onClick={() => setActiveTool(id)}
                  aria-pressed={isActive}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    isActive
                      ? "border-gold-500/60 bg-gold-500/10 text-gold-200"
                      : "border-transparent text-sand-300 hover:bg-stone-800/70"
                  }`}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  <div>
                    <div className="text-sm font-semibold">{label}</div>
                    <div className="text-[11px] text-sand-400">{sub}</div>
                  </div>
                </button>
              </Tooltip>
            );
          })}
        </div>
        <p className="mt-2 text-[10px] text-sand-500">Tip: press 1–5 on your keyboard to switch tools instantly.</p>
      </Panel>

      <Panel eyebrow="Tool Durability">
        <ProgressBar value={toolDurability} color="bronze" showPercent />
      </Panel>

      <Panel eyebrow="Dig Energy">
        <div className="mb-1 flex items-center gap-2 text-gold-300">
          <Zap size={16} />
          <span className="text-sm font-semibold text-sand-50">
            {user?.digEnergy ?? 0} / {user?.maxDigEnergy ?? 100}
          </span>
        </div>
        <ProgressBar value={((user?.digEnergy ?? 0) / (user?.maxDigEnergy ?? 100)) * 100} color="gold" height="sm" />
        <p className="mt-1.5 text-[11px] text-sand-400">Next energy in {formatCountdown(user?.nextEnergyAt ?? null)}</p>
      </Panel>
    </div>
  );
}

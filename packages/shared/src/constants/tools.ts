import type { ToolDefinition } from "../types/domain";

export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  brush: {
    id: "brush",
    name: "Brush",
    description: "Safe and slow. The archaeologist's default.",
    speed: 1,
    damageRisk: 0.02,
    effect: "clear_surface",
    durabilityCostPerUse: 0.4,
  },
  pickaxe: {
    id: "pickaxe",
    name: "Pickaxe",
    description: "Fast, but dangerous near fragile finds.",
    speed: 3,
    damageRisk: 0.35,
    effect: "break_rock",
    durabilityCostPerUse: 1.2,
  },
  fine_brush: {
    id: "fine_brush",
    name: "Fine Brush",
    description: "Best for fragile fossils.",
    speed: 0.6,
    damageRisk: 0.01,
    effect: "clear_fragile",
    durabilityCostPerUse: 0.3,
  },
  air_blower: {
    id: "air_blower",
    name: "Air Blower",
    description: "Removes loose dust without touching what's beneath.",
    speed: 1.4,
    damageRisk: 0,
    effect: "clear_dust",
    durabilityCostPerUse: 0.2,
  },
  water_spray: {
    id: "water_spray",
    name: "Water Spray",
    description: "Reveals faded inscriptions.",
    speed: 1,
    damageRisk: 0.05,
    effect: "reveal_inscription",
    durabilityCostPerUse: 0.5,
  },
};

import type { ToolId } from "@sediment/shared";

export interface ToolBehavior {
  id: ToolId;
  brushRadius: number;
  eraseStrength: number; // how much grid coverage one stroke clears (0-1)
  particleCount: number;
  particleSpeed: number;
  damageRisk: number; // chance per stroke to nick a nearby artifact if condition is fragile
  debrisForce: number; // force applied to loose Matter debris bodies nearby
  revealsInscription: boolean;
}

export const TOOL_BEHAVIORS: Record<ToolId, ToolBehavior> = {
  brush: {
    id: "brush",
    brushRadius: 26,
    eraseStrength: 0.55,
    particleCount: 4,
    particleSpeed: 40,
    damageRisk: 0.005,
    debrisForce: 0.0015,
    revealsInscription: false,
  },
  pickaxe: {
    id: "pickaxe",
    brushRadius: 40,
    eraseStrength: 1,
    particleCount: 10,
    particleSpeed: 120,
    damageRisk: 0.12,
    debrisForce: 0.008,
    revealsInscription: false,
  },
  fine_brush: {
    id: "fine_brush",
    brushRadius: 14,
    eraseStrength: 0.3,
    particleCount: 2,
    particleSpeed: 20,
    damageRisk: 0.002,
    debrisForce: 0.0008,
    revealsInscription: false,
  },
  air_blower: {
    id: "air_blower",
    brushRadius: 34,
    eraseStrength: 0.4,
    particleCount: 8,
    particleSpeed: 90,
    damageRisk: 0,
    debrisForce: 0.01,
    revealsInscription: false,
  },
  water_spray: {
    id: "water_spray",
    brushRadius: 30,
    eraseStrength: 0.45,
    particleCount: 6,
    particleSpeed: 30,
    damageRisk: 0.01,
    debrisForce: 0.001,
    revealsInscription: true,
  },
};

export function getToolBehavior(id: ToolId): ToolBehavior {
  return TOOL_BEHAVIORS[id];
}

import { describe, expect, it } from "vitest";
import { getToolBehavior, TOOL_BEHAVIORS } from "../src/tools/ToolController";

describe("ToolController", () => {
  it("defines behavior for every tool id", () => {
    const ids = ["brush", "pickaxe", "fine_brush", "air_blower", "water_spray"] as const;
    for (const id of ids) {
      expect(TOOL_BEHAVIORS[id]).toBeDefined();
      expect(getToolBehavior(id).id).toBe(id);
    }
  });

  it("pickaxe is faster but riskier than brush", () => {
    const brush = getToolBehavior("brush");
    const pickaxe = getToolBehavior("pickaxe");
    expect(pickaxe.eraseStrength).toBeGreaterThan(brush.eraseStrength);
    expect(pickaxe.damageRisk).toBeGreaterThan(brush.damageRisk);
  });

  it("fine brush has the lowest damage risk among tools that carry any risk", () => {
    const risky = Object.values(TOOL_BEHAVIORS).filter((t) => t.damageRisk > 0);
    const minRisk = Math.min(...risky.map((t) => t.damageRisk));
    expect(getToolBehavior("fine_brush").damageRisk).toBe(minRisk);
  });

  it("only water spray reveals inscriptions", () => {
    for (const tool of Object.values(TOOL_BEHAVIORS)) {
      expect(tool.revealsInscription).toBe(tool.id === "water_spray");
    }
  });

  it("air blower carries no damage risk", () => {
    expect(getToolBehavior("air_blower").damageRisk).toBe(0);
  });
});

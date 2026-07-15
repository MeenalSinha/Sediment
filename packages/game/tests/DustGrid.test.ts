import { describe, expect, it } from "vitest";
import { DustGrid } from "../src/systems/DustGrid";

describe("DustGrid", () => {
  it("starts fully covered (0% cleared)", () => {
    const grid = new DustGrid(400, 300, 40);
    expect(grid.getClearedPercent()).toBe(0);
  });

  it("increases cleared percent after a stroke", () => {
    const grid = new DustGrid(400, 300, 40);
    grid.applyStroke(200, 150, 40, 1);
    expect(grid.getClearedPercent()).toBeGreaterThan(0);
  });

  it("never exceeds 100% cleared even with excessive strokes", () => {
    const grid = new DustGrid(400, 300, 20);
    for (let i = 0; i < 200; i++) {
      grid.applyStroke(200, 150, 60, 1);
    }
    expect(grid.getClearedPercent()).toBeLessThanOrEqual(100);
  });

  it("clears more area for a larger brush radius", () => {
    const gridSmall = new DustGrid(400, 300, 40);
    const gridLarge = new DustGrid(400, 300, 40);
    gridSmall.applyStroke(200, 150, 10, 1);
    gridLarge.applyStroke(200, 150, 60, 1);
    expect(gridLarge.getClearedPercent()).toBeGreaterThan(gridSmall.getClearedPercent());
  });

  it("reset() restores full coverage", () => {
    const grid = new DustGrid(400, 300, 40);
    grid.applyStroke(200, 150, 40, 1);
    grid.reset();
    expect(grid.getClearedPercent()).toBe(0);
  });

  it("getRegionCoverage reflects strokes applied within that region", () => {
    const grid = new DustGrid(400, 300, 40);
    // Region far from the stroke should remain fully covered (coverage close to 1).
    grid.applyStroke(20, 20, 15, 1);
    const farRegion = grid.getRegionCoverage(300, 200, 50, 50);
    expect(farRegion).toBeGreaterThan(0.9);
  });
});

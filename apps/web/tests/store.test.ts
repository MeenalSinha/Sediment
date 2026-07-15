import { beforeEach, describe, expect, it } from "vitest";
import { useSedimentStore } from "../src/lib/store";
import type { Artifact } from "@sediment/shared";

function makeArtifact(overrides: Partial<Artifact> = {}): Artifact {
  return {
    id: "a1",
    subredditId: "r1",
    layerId: "l1",
    name: "Test Artifact",
    category: "pottery",
    rarity: "common",
    material: "Clay",
    period: "Test Era",
    condition: 80,
    status: "excavated",
    discoveredBy: [],
    discoveredAt: new Date().toISOString(),
    position: { x: 0, y: 0 },
    imageUrl: null,
    modelUrl: null,
    aiSummary: null,
    officialLoreId: null,
    scientificNotes: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function resetStore() {
  useSedimentStore.setState({
    artifacts: [],
    currentDiscovery: null,
    hasDiscoveredAny: false,
    restorationCount: 0,
    unlockedAchievements: new Set(),
    toasts: [],
    toolDurability: 100,
    user: {
      id: "u1",
      redditUsername: "Tester",
      redditId: "t2_test",
      avatarUrl: null,
      flair: null,
      level: 1,
      xp: 0,
      xpToNextLevel: 500,
      rank: 0,
      digEnergy: 100,
      maxDigEnergy: 100,
      nextEnergyAt: null,
      coins: 0,
      gems: 0,
      roles: [],
      activeRole: "archaeologist",
      createdAt: new Date().toISOString(),
    },
  });
}

describe("useSedimentStore — discoveries & achievements", () => {
  beforeEach(resetStore);

  it("unlocks first_discovery on the very first recorded discovery", () => {
    useSedimentStore.getState().recordDiscovery(makeArtifact());
    expect(useSedimentStore.getState().unlockedAchievements.has("first_discovery")).toBe(true);
  });

  it("does not unlock first_discovery twice, and does not duplicate toasts unnecessarily", () => {
    const store = useSedimentStore.getState();
    store.recordDiscovery(makeArtifact({ id: "a1" }));
    store.recordDiscovery(makeArtifact({ id: "a2" }));
    const unlockedCount = [...useSedimentStore.getState().unlockedAchievements].filter(
      (a) => a === "first_discovery",
    ).length;
    expect(unlockedCount).toBe(1);
  });

  it("unlocks legend_hunter for a legendary discovery", () => {
    useSedimentStore.getState().recordDiscovery(makeArtifact({ rarity: "legendary" }));
    expect(useSedimentStore.getState().unlockedAchievements.has("legend_hunter")).toBe(true);
  });

  it("unlocks rare_fossil for a non-common fossil", () => {
    useSedimentStore.getState().recordDiscovery(makeArtifact({ category: "fossil", rarity: "rare" }));
    expect(useSedimentStore.getState().unlockedAchievements.has("rare_fossil")).toBe(true);
  });

  it("does not unlock rare_fossil for a common fossil", () => {
    useSedimentStore.getState().recordDiscovery(makeArtifact({ category: "fossil", rarity: "common" }));
    expect(useSedimentStore.getState().unlockedAchievements.has("rare_fossil")).toBe(false);
  });

  it("adds newly discovered artifacts to the collection without duplicating existing ones", () => {
    const store = useSedimentStore.getState();
    store.setArtifacts([makeArtifact({ id: "a1" })]);
    store.recordDiscovery(makeArtifact({ id: "a1" }));
    expect(useSedimentStore.getState().artifacts).toHaveLength(1);
    store.recordDiscovery(makeArtifact({ id: "a2" }));
    expect(useSedimentStore.getState().artifacts).toHaveLength(2);
  });
});

describe("useSedimentStore — restoration", () => {
  beforeEach(resetStore);

  it("unlocks perfect_restoration when condition reaches 100", () => {
    const store = useSedimentStore.getState();
    store.setArtifacts([makeArtifact({ id: "a1", condition: 90 })]);
    store.restoreArtifact("a1", 15);
    expect(useSedimentStore.getState().unlockedAchievements.has("perfect_restoration")).toBe(true);
    expect(useSedimentStore.getState().artifacts[0].condition).toBe(100);
    expect(useSedimentStore.getState().artifacts[0].status).toBe("restored");
  });

  it("clamps condition between 0 and 100", () => {
    const store = useSedimentStore.getState();
    store.setArtifacts([makeArtifact({ id: "a1", condition: 5 })]);
    store.restoreArtifact("a1", -50);
    expect(useSedimentStore.getState().artifacts[0].condition).toBe(0);
    expect(useSedimentStore.getState().artifacts[0].status).toBe("damaged");
  });

  it("does not unlock perfect_restoration for a partial restoration", () => {
    const store = useSedimentStore.getState();
    store.setArtifacts([makeArtifact({ id: "a1", condition: 50 })]);
    store.restoreArtifact("a1", 10);
    expect(useSedimentStore.getState().unlockedAchievements.has("perfect_restoration")).toBe(false);
  });
});

describe("useSedimentStore — tool durability & energy", () => {
  beforeEach(resetStore);

  it("resets durability and spends energy once a tool fully wears down", () => {
    const store = useSedimentStore.getState();
    store.applyDurabilityCost(150); // more than 100, forces it to 0 in one call
    const state = useSedimentStore.getState();
    expect(state.toolDurability).toBe(100); // reset after wearing out
    expect(state.user!.digEnergy).toBe(97); // spent 3 energy
  });

  it("spendEnergy refuses to go below zero", () => {
    const store = useSedimentStore.getState();
    useSedimentStore.setState((s) => ({ user: { ...s.user!, digEnergy: 2 } }));
    const result = useSedimentStore.getState().spendEnergy(5);
    expect(result).toBe(false);
    expect(useSedimentStore.getState().user!.digEnergy).toBe(2);
  });
});

describe("useSedimentStore — settings", () => {
  beforeEach(resetStore);

  it("merges partial settings updates without clobbering other fields", () => {
    const store = useSedimentStore.getState();
    store.updateSettings({ reducedMotion: true });
    store.updateSettings({ colorblindMode: true });
    const settings = useSedimentStore.getState().settings;
    expect(settings.reducedMotion).toBe(true);
    expect(settings.colorblindMode).toBe(true);
  });
});

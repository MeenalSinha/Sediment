import { create } from "zustand";
import type { Artifact, DigLayer, FeedItem, RoleId, SedimentUser, ToolId } from "@sediment/shared";
import { ACHIEVEMENTS } from "@sediment/shared";
import { setSoundEnabled, sfx } from "./sound";

export type PageId = "dig_site" | "museum" | "journal" | "civilization" | "roles" | "events" | "shop";

export interface ToastMessage {
  id: string;
  kind: "achievement" | "discovery" | "legendary" | "info";
  title: string;
  body: string;
}

export interface AccessibilitySettings {
  colorblindMode: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  subtitles: boolean;
}

export interface JournalEntry {
  id: string;
  createdAt: string;
  body: string;
}

export interface LocalLoreEntry {
  id: string;
  author: string;
  body: string;
  votes: number;
  isOfficial: boolean;
}

interface SedimentState {
  // Identity & navigation
  user: SedimentUser | null;
  activePage: PageId;
  setUser: (user: SedimentUser | null) => void;
  setActivePage: (page: PageId) => void;

  // Dig site
  activeLayer: DigLayer | null;
  currentDiscovery: Artifact | null;
  activeTool: ToolId;
  toolDurability: number;
  progressPercent: number;
  setActiveLayer: (layer: DigLayer | null) => void;
  setCurrentDiscovery: (artifact: Artifact | null) => void;
  setActiveTool: (tool: ToolId) => void;
  applyDurabilityCost: (cost: number) => void;
  setProgressPercent: (percent: number) => void;
  spendEnergy: (amount: number) => boolean;
  takeArtifactDamage: (amount: number) => void;

  // Feed
  feed: FeedItem[];
  pushFeedItem: (item: FeedItem) => void;

  // Museum / collection
  artifacts: Artifact[];
  setArtifacts: (artifacts: Artifact[]) => void;
  restoreArtifact: (id: string, qualityDelta: number) => void;
  recordDiscovery: (artifact: Artifact) => void;
  hasDiscoveredAny: boolean;
  restorationCount: number;
  discoveryQueue: Artifact[];
  setDiscoveryQueue: (queue: Artifact[]) => void;
  revealNextArtifact: () => void;

  // Journal
  journal: JournalEntry[];
  addJournalEntry: (body: string) => void;

  // Community lore, keyed by artifact id
  loreByArtifact: Record<string, LocalLoreEntry[]>;
  addLore: (artifactId: string, author: string, body: string) => void;
  voteLore: (artifactId: string, loreId: string) => void;

  // Roles & XP
  activeRole: RoleId;
  roleProgress: Record<RoleId, { level: number; xp: number }>;
  setActiveRole: (role: RoleId) => void;
  grantRoleXp: (role: RoleId, xp: number) => void;

  // Achievements
  unlockedAchievements: Set<string>;
  unlockAchievement: (id: string) => void;

  // Toasts
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;

  // Accessibility / settings
  settings: AccessibilitySettings;
  updateSettings: (patch: Partial<AccessibilitySettings>) => void;

  // Season pass claims
  claimedTiers: number[];
  claimTier: (tier: number) => void;
}

const ALL_ROLE_IDS: RoleId[] = [
  "archaeologist",
  "historian",
  "conservator",
  "linguist",
  "curator",
  "cartographer",
  "researcher",
  "photographer",
  "storyteller",
];

function initialRoleProgress(): Record<RoleId, { level: number; xp: number }> {
  const out = {} as Record<RoleId, { level: number; xp: number }>;
  for (const role of ALL_ROLE_IDS) {
    out[role] = role === "archaeologist" ? { level: 24, xp: 4250 } : { level: 1, xp: 0 };
  }
  return out;
}

export const useSedimentStore = create<SedimentState>((set, get) => ({
  user: null,
  activePage: "dig_site",
  setUser: (user) => set({ user }),
  setActivePage: (page) => set({ activePage: page }),

  activeLayer: null,
  currentDiscovery: null,
  activeTool: "brush",
  toolDurability: 100,
  progressPercent: 0,
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setCurrentDiscovery: (artifact) => set({ currentDiscovery: artifact }),
  setActiveTool: (tool) => {
    sfx.click();
    set({ activeTool: tool, toolDurability: 100 });
  },
  applyDurabilityCost: (cost) => {
    const before = get().toolDurability;
    const after = Math.max(0, before - cost);
    set({ toolDurability: after });
    if (after === 0 && before > 0) {
      const spent = get().spendEnergy(3);
      set({ toolDurability: 100 });
      if (spent) {
        get().pushToast({ kind: "info", title: "Tool worn down", body: "Spent 3 dig energy to keep your tool sharp." });
      }
    }
  },
  setProgressPercent: (percent) => set({ progressPercent: percent }),
  spendEnergy: (amount) => {
    const { user } = get();
    if (!user || user.digEnergy < amount) return false;
    set({ user: { ...user, digEnergy: user.digEnergy - amount } });
    return true;
  },
  takeArtifactDamage: (amount) => {
    const { currentDiscovery } = get();
    if (!currentDiscovery) return;
    const condition = Math.max(0, currentDiscovery.condition - amount);
    set({ currentDiscovery: { ...currentDiscovery, condition } });
  },

  feed: [],
  pushFeedItem: (item) => set((s) => ({ feed: [item, ...s.feed].slice(0, 50) })),

  artifacts: [],
  setArtifacts: (artifacts) => set({ artifacts }),
  hasDiscoveredAny: false,
  restorationCount: 0,
  discoveryQueue: [],
  setDiscoveryQueue: (queue) => set({ discoveryQueue: queue }),
  revealNextArtifact: () => {
    const { discoveryQueue, recordDiscovery } = get();
    if (discoveryQueue.length === 0) return;
    const [next, ...rest] = discoveryQueue;
    set({ discoveryQueue: rest });
    recordDiscovery(next);
  },
  recordDiscovery: (artifact) => {
    const { hasDiscoveredAny, unlockAchievement, pushToast } = get();
    set((s) => ({
      currentDiscovery: artifact,
      hasDiscoveredAny: true,
      artifacts: s.artifacts.some((a) => a.id === artifact.id) ? s.artifacts : [artifact, ...s.artifacts],
    }));

    if (!hasDiscoveredAny) unlockAchievement("first_discovery");
    if (artifact.rarity === "legendary") {
      unlockAchievement("legend_hunter");
      sfx.legendary();
      pushToast({
        kind: "legendary",
        title: "Legendary Discovery!",
        body: `${artifact.name} — the whole community celebrates.`,
      });
    } else {
      sfx.discovery();
      pushToast({ kind: "discovery", title: "Artifact Discovered", body: artifact.name });
    }
    if (artifact.category === "fossil" && artifact.rarity !== "common") {
      unlockAchievement("rare_fossil");
    }
  },
  restoreArtifact: (id, qualityDelta) => {
    set((s) => ({
      artifacts: s.artifacts.map((a) => {
        if (a.id !== id) return a;
        const condition = Math.max(0, Math.min(100, a.condition + qualityDelta));
        const status = condition >= 100 ? "restored" : condition <= 0 ? "damaged" : "in_restoration";
        return { ...a, condition, status };
      }),
      currentDiscovery:
        s.currentDiscovery?.id === id
          ? {
              ...s.currentDiscovery,
              condition: Math.max(0, Math.min(100, s.currentDiscovery.condition + qualityDelta)),
            }
          : s.currentDiscovery,
    }));

    const { artifacts, unlockAchievement, restorationCount } = get();
    const updated = artifacts.find((a) => a.id === id);
    if (updated?.status === "restored") {
      const nextCount = restorationCount + 1;
      set({ restorationCount: nextCount });
      if (updated.condition >= 100) unlockAchievement("perfect_restoration");
      if (nextCount >= 25) unlockAchievement("master_conservator");
    }
  },

  journal: [],
  addJournalEntry: (body) =>
    set((s) => ({ journal: [{ id: crypto.randomUUID(), createdAt: new Date().toISOString(), body }, ...s.journal] })),

  loreByArtifact: {
    artifact_1: [
      {
        id: "lore_1",
        author: "LoreWeaver",
        body: "The eye shape matches the murals found in the Eastern Chamber — likely a Sun Priest ceremonial mask.",
        votes: 124,
        isOfficial: true,
      },
      {
        id: "lore_2",
        author: "HistoryBuff92",
        body: "Could this belong to the Sun Priests mentioned in the old inscriptions?",
        votes: 98,
        isOfficial: false,
      },
    ],
  },
  addLore: (artifactId, author, body) =>
    set((s) => {
      const existing = s.loreByArtifact[artifactId] ?? [];
      const entry: LocalLoreEntry = { id: crypto.randomUUID(), author, body, votes: 1, isOfficial: false };
      return { loreByArtifact: { ...s.loreByArtifact, [artifactId]: [entry, ...existing] } };
    }),
  voteLore: (artifactId, loreId) =>
    set((s) => {
      const entries = (s.loreByArtifact[artifactId] ?? []).map((e) =>
        e.id === loreId ? { ...e, votes: e.votes + 1 } : e,
      );
      const top = entries.reduce((a, b) => (b.votes > a.votes ? b : a), entries[0]);
      const updated = entries.map((e) => ({ ...e, isOfficial: top ? e.id === top.id : false }));
      return { loreByArtifact: { ...s.loreByArtifact, [artifactId]: updated } };
    }),

  activeRole: "archaeologist",
  roleProgress: initialRoleProgress(),
  setActiveRole: (role) => set({ activeRole: role }),
  grantRoleXp: (role, xp) =>
    set((s) => {
      const current = s.roleProgress[role];
      const totalXp = current.xp + xp;
      const level = Math.floor(totalXp / 500) + 1;
      return { roleProgress: { ...s.roleProgress, [role]: { level, xp: totalXp } } };
    }),

  unlockedAchievements: new Set<string>(),
  unlockAchievement: (id) => {
    const { unlockedAchievements, pushToast } = get();
    if (unlockedAchievements.has(id)) return;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    const next = new Set(unlockedAchievements);
    next.add(id);
    set({ unlockedAchievements: next });
    sfx.achievement();
    pushToast({ kind: "achievement", title: "Achievement Unlocked", body: def?.name ?? id });
  },

  toasts: [],
  pushToast: (toast) => {
    const id = crypto.randomUUID();
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => get().dismissToast(id), 5000);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  settings: { colorblindMode: false, reducedMotion: false, soundEnabled: true, subtitles: false },
  updateSettings: (patch) =>
    set((s) => {
      const next = { ...s.settings, ...patch };
      if (patch.soundEnabled !== undefined) setSoundEnabled(patch.soundEnabled);
      return { settings: next };
    }),

  claimedTiers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  claimTier: (tier) => set((s) => ({ claimedTiers: [...s.claimedTiers, tier] })),
}));

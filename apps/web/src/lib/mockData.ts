import type {
  Artifact,
  CivilizationTimelineEvent,
  CommunityEvent,
  DigLayer,
  FeedItem,
  RoleId,
  Season,
  SeasonPassProgress,
  SedimentUser,
} from "@sediment/shared";
import type { CollectionTally } from "@/components/MuseumCollectionBar";

export const demoUser: SedimentUser = {
  id: "u_demo",
  redditUsername: "DustSeeker",
  redditId: "t2_demo",
  avatarUrl: null,
  flair: "Archaeologist",
  level: 24,
  xp: 4250,
  xpToNextLevel: 6000,
  rank: 2450,
  digEnergy: 86,
  maxDigEnergy: 100,
  nextEnergyAt: new Date(Date.now() + 92 * 60_000).toISOString(),
  coins: 45650,
  gems: 1240,
  roles: [],
  activeRole: "archaeologist",
  createdAt: new Date().toISOString(),
};

export const demoLayer: DigLayer = {
  id: "layer_7",
  subredditId: "r_history",
  index: 7,
  name: "The Sunken Courtyard",
  unlockedAt: new Date().toISOString(),
  progress: 63,
  chamberType: "ruins",
  isRareChamber: false,
};

export const demoArtifact: Artifact = {
  id: "artifact_1",
  subredditId: "r_history",
  layerId: "layer_7",
  name: "Ceremonial Mask Fragment",
  category: "mask",
  rarity: "uncommon",
  material: "Bronze, Turquoise",
  period: "Late Golden Age",
  condition: 72,
  status: "excavated",
  discoveredBy: new Array(342).fill("digger"),
  discoveredAt: new Date().toISOString(),
  position: { x: 0, y: 0 },
  imageUrl: null,
  modelUrl: null,
  aiSummary: null,
  officialLoreId: null,
  scientificNotes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const demoFeed: FeedItem[] = [
  {
    id: "f1",
    userId: "u1",
    username: "LoreWeaver",
    role: "historian",
    body: "The eye shape matches the murals found in the Eastern Chamber.",
    createdAt: new Date(Date.now() - 12 * 60_000).toISOString(),
    upvotes: 124,
    artifactId: "artifact_1",
  },
  {
    id: "f2",
    userId: "u2",
    username: "HistoryBuff92",
    role: "researcher",
    body: "Could this belong to the Sun Priests mentioned in the old inscriptions?",
    createdAt: new Date(Date.now() - 18 * 60_000).toISOString(),
    upvotes: 98,
    artifactId: "artifact_1",
  },
  {
    id: "f3",
    userId: "u3",
    username: "StoneKeeper",
    role: "archaeologist",
    body: "Maybe part of a larger mask? Let's keep digging.",
    createdAt: new Date(Date.now() - 25 * 60_000).toISOString(),
    upvotes: 76,
    artifactId: "artifact_1",
  },
];

export const demoSeason: Season = {
  id: "season_1",
  name: "The Lost Empire",
  civilizationTheme: "Desert Empire",
  startsAt: new Date(Date.now() - 10 * 86_400_000).toISOString(),
  endsAt: new Date(Date.now() + 32 * 86_400_000 + 18 * 3_600_000).toISOString(),
  passTierMax: 25,
};

export const demoSeasonPassProgress: SeasonPassProgress = {
  seasonId: "season_1",
  userId: "u_demo",
  xp: 4250,
  tier: 10,
  claimedTiers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

export const demoCategories: CollectionTally[] = [
  { category: "pottery", icon: "pottery", discovered: 14, total: 48 },
  { category: "tools", icon: "tools", discovered: 9, total: 32 },
  { category: "jewelry", icon: "jewelry", discovered: 8, total: 29 },
  { category: "weapons", icon: "weapons", discovered: 6, total: 25 },
  { category: "relics", icon: "relics", discovered: 4, total: 18 },
  { category: "fossils", icon: "fossils", discovered: 5, total: 21 },
  { category: "inscriptions", icon: "inscriptions", discovered: 11, total: 35 },
  { category: "skeletal", icon: "skeletal", discovered: 10, total: 40 },
];

export const demoGlobalEvent: CommunityEvent = {
  id: "ev1",
  subredditId: "r_history",
  type: "double_restoration_weekend",
  title: "Global Event: Double Restoration Weekend!",
  description: "All restoration XP is doubled.",
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 28 * 3_600_000).toISOString(),
  progress: null,
  goal: null,
};

export const demoCommunityGoalEvent: CommunityEvent = {
  id: "ev2",
  subredditId: "r_history",
  type: "legendary_discovery_hunt",
  title: "Legendary Discovery Hunt — Find the Sun King's Tomb",
  description: "Community goal.",
  startsAt: new Date().toISOString(),
  endsAt: new Date(Date.now() + 42 * 3_600_000).toISOString(),
  progress: 72,
  goal: 100,
};

// ---------- Museum collection (multiple artifacts across statuses) ----------

function makeArtifact(overrides: Partial<Artifact> & Pick<Artifact, "id" | "name" | "category" | "rarity">): Artifact {
  return {
    subredditId: "r_history",
    layerId: "layer_7",
    material: "Unknown",
    period: "Unclassified Era",
    condition: 100,
    status: "restored",
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

export const demoMuseumArtifacts: Artifact[] = [
  makeArtifact({
    id: "artifact_1",
    name: "Ceremonial Mask Fragment",
    category: "mask",
    rarity: "uncommon",
    material: "Bronze, Turquoise",
    period: "Late Golden Age",
    condition: 72,
    status: "excavated",
    discoveredBy: new Array(342).fill("digger"),
    aiSummary:
      "A partial bronze mask inlaid with turquoise, likely worn during Sun Priest processions in the Late Golden Age.",
  }),
  makeArtifact({
    id: "artifact_2",
    name: "Sunken Amphora",
    category: "pottery",
    rarity: "common",
    material: "Terracotta",
    period: "Founding Era",
    condition: 95,
    status: "restored",
    discoveredBy: new Array(120).fill("digger"),
  }),
  makeArtifact({
    id: "artifact_3",
    name: "Sun King's Signet",
    category: "jewelry",
    rarity: "legendary",
    material: "Gold, Obsidian",
    period: "Golden Age",
    condition: 88,
    status: "restored",
    discoveredBy: new Array(981).fill("digger"),
    aiSummary: "A gold signet ring bearing the sun-disc crest, believed to have belonged to the last Sun King.",
  }),
  makeArtifact({
    id: "artifact_4",
    name: "Bronze Short Sword",
    category: "weapon",
    rarity: "rare",
    material: "Bronze",
    period: "War Era",
    condition: 61,
    status: "restored",
    discoveredBy: new Array(88).fill("digger"),
  }),
  makeArtifact({
    id: "artifact_5",
    name: "Fossilized Coral Fragment",
    category: "fossil",
    rarity: "common",
    material: "Fossilized Coral",
    period: "Pre-civilization",
    condition: 100,
    status: "restored",
    discoveredBy: new Array(40).fill("digger"),
  }),
  makeArtifact({
    id: "artifact_6",
    name: "Inscribed Boundary Stone",
    category: "relic",
    rarity: "rare",
    material: "Limestone",
    period: "Founding Era",
    condition: 54,
    status: "in_restoration",
    discoveredBy: new Array(210).fill("digger"),
  }),
  makeArtifact({
    id: "artifact_7",
    name: "Child's Clay Rattle",
    category: "unknown",
    rarity: "common",
    material: "Fired Clay",
    period: "Golden Age",
    condition: 40,
    status: "damaged",
    discoveredBy: new Array(15).fill("digger"),
  }),
  makeArtifact({
    id: "artifact_8",
    name: "Skeletal Remains — Chamber 3",
    category: "skeleton",
    rarity: "uncommon",
    material: "Bone",
    period: "Collapse Era",
    condition: 66,
    status: "restored",
    discoveredBy: new Array(300).fill("digger"),
  }),
];

// ---------- Civilization timeline ----------

export const demoCivilizationName = "The Sun Priests of Kalveth";
export const demoCivilizationOriginStory =
  "A desert empire that rose around a sunken courtyard oasis, ruled by an order of Sun Priests until an " +
  "unexplained collapse scattered its people and buried its temples in sediment for a thousand years.";

export const demoTimeline: CivilizationTimelineEvent[] = [
  {
    id: "t1",
    civilizationId: "civ_1",
    era: "founding",
    year: 0,
    title: "Kingdom Founded",
    description: "Nomadic clans settle around the oasis, founding the first courtyard temple.",
    triggeredByArtifactId: "artifact_2",
  },
  {
    id: "t2",
    civilizationId: "civ_1",
    era: "war",
    year: 140,
    title: "The Bronze Wars",
    description: "Border skirmishes with a rival desert clan lead to fortification of the harbor district.",
    triggeredByArtifactId: "artifact_4",
  },
  {
    id: "t3",
    civilizationId: "civ_1",
    era: "golden_age",
    year: 210,
    title: "The Golden Age",
    description: "The Sun Priests consolidate power; ceremonial masks and gold regalia proliferate.",
    triggeredByArtifactId: "artifact_1",
  },
  {
    id: "t4",
    civilizationId: "civ_1",
    era: "collapse",
    year: 340,
    title: "The Sinking",
    description: "The courtyard floods and the empire collapses within a generation, for reasons still unknown.",
    triggeredByArtifactId: "artifact_6",
  },
  {
    id: "t5",
    civilizationId: "civ_1",
    era: "rediscovery",
    year: 2026,
    title: "Rediscovery",
    description: "The community begins excavating the sunken courtyard, layer by layer.",
    triggeredByArtifactId: null,
  },
];

// ---------- Leaderboard ----------

export interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  role: RoleId;
  artifactsFound: number;
}

export const demoLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "SandOracle", level: 41, role: "curator", artifactsFound: 512 },
  { rank: 2, username: "ReliquaryRex", level: 38, role: "conservator", artifactsFound: 470 },
  { rank: 3, username: "DustSeeker", level: 24, role: "archaeologist", artifactsFound: 342 },
  { rank: 4, username: "LoreWeaver", level: 22, role: "historian", artifactsFound: 301 },
  { rank: 5, username: "HistoryBuff92", level: 19, role: "researcher", artifactsFound: 276 },
  { rank: 6, username: "StoneKeeper", level: 17, role: "archaeologist", artifactsFound: 240 },
  { rank: 7, username: "MapMaker99", level: 15, role: "cartographer", artifactsFound: 198 },
  { rank: 8, username: "ShutterShard", level: 12, role: "photographer", artifactsFound: 150 },
];

// ---------- Shop ----------

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: "coins" | "gems";
  category: "tool_skin" | "cosmetic" | "boost";
}

export const demoShopItems: ShopItem[] = [
  {
    id: "s1",
    name: "Weathered Leather Brush",
    description: "A cosmetic brush skin.",
    price: 2000,
    currency: "coins",
    category: "tool_skin",
  },
  {
    id: "s2",
    name: "Gilded Pickaxe",
    description: "A cosmetic pickaxe skin.",
    price: 1500,
    currency: "gems",
    category: "tool_skin",
  },
  {
    id: "s3",
    name: "Dust Storm Booster",
    description: "+20% dig energy regen for 24h.",
    price: 500,
    currency: "gems",
    category: "boost",
  },
  {
    id: "s4",
    name: "Curator's Lantern",
    description: "A cosmetic profile badge.",
    price: 3200,
    currency: "coins",
    category: "cosmetic",
  },
  {
    id: "s5",
    name: "Season Pass Tier Skip",
    description: "Instantly unlock the next tier.",
    price: 800,
    currency: "gems",
    category: "boost",
  },
  {
    id: "s6",
    name: "Sandstone Frame",
    description: "A museum profile frame.",
    price: 1800,
    currency: "coins",
    category: "cosmetic",
  },
];

// ---------- Discovery queue (buried artifacts revealed as the demo dig progresses) ----------

export const demoDiscoveryQueue: Artifact[] = [
  makeArtifact({
    id: "artifact_9",
    name: "Obsidian Ceremonial Blade",
    category: "weapon",
    rarity: "rare",
    material: "Obsidian",
    period: "Golden Age",
    condition: 78,
    status: "excavated",
    discoveredBy: [],
  }),
  makeArtifact({
    id: "artifact_10",
    name: "The Sun King's Burial Mask",
    category: "mask",
    rarity: "legendary",
    material: "Gold, Lapis Lazuli",
    period: "Golden Age",
    condition: 91,
    status: "excavated",
    discoveredBy: [],
    aiSummary: "A near-perfectly preserved gold death mask — almost certainly belonging to a Sun King himself.",
  }),
  makeArtifact({
    id: "artifact_11",
    name: "Weathered Trade Ledger Tablet",
    category: "tool",
    rarity: "uncommon",
    material: "Clay",
    period: "Founding Era",
    condition: 82,
    status: "excavated",
    discoveredBy: [],
  }),
];

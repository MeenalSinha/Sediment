// ============================================================
// Sediment — Shared Domain Types
// Single source of truth for the shape of data that flows
// between the game engine, the web app, and the API.
// ============================================================

export type ToolId = "brush" | "pickaxe" | "fine_brush" | "air_blower" | "water_spray";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  speed: number;
  damageRisk: number;
  effect: "clear_surface" | "break_rock" | "clear_fragile" | "clear_dust" | "reveal_inscription";
  durabilityCostPerUse: number;
}

export type ArtifactCategory =
  | "weapon"
  | "pottery"
  | "jewelry"
  | "mask"
  | "coin"
  | "book"
  | "scroll"
  | "mural"
  | "skeleton"
  | "fossil"
  | "map"
  | "instrument"
  | "machine"
  | "relic"
  | "temple"
  | "statue"
  | "crown"
  | "tool"
  | "unknown";

export type Rarity = "common" | "uncommon" | "rare" | "legendary";

export type RestorationStatus = "buried" | "excavated" | "in_restoration" | "restored" | "damaged";

export interface Artifact {
  id: string;
  subredditId: string;
  layerId: string;
  name: string;
  category: ArtifactCategory;
  rarity: Rarity;
  material: string;
  period: string;
  condition: number; // 0-100
  status: RestorationStatus;
  discoveredBy: string[]; // user ids who contributed to the dig
  discoveredAt: string | null;
  position: { x: number; y: number };
  imageUrl: string | null;
  modelUrl: string | null;
  aiSummary: string | null;
  officialLoreId: string | null;
  scientificNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoreEntry {
  id: string;
  artifactId: string;
  authorId: string;
  body: string;
  votes: number;
  isOfficial: boolean;
  aiPolished: boolean;
  createdAt: string;
}

export interface DigLayer {
  id: string;
  subredditId: string;
  index: number; // layer 1..N
  name: string;
  unlockedAt: string;
  progress: number; // 0-100, community aggregate
  chamberType:
    | "temple"
    | "village"
    | "necropolis"
    | "marketplace"
    | "library"
    | "palace"
    | "harbor"
    | "catacombs"
    | "ruins"
    | "hidden_cave";
  isRareChamber: boolean;
}

export interface DigCell {
  id: string;
  layerId: string;
  gridX: number;
  gridY: number;
  material: "dust" | "pebble" | "rock" | "sand" | "pottery_shard" | "clear";
  hitpoints: number;
  artifactId: string | null;
}

export interface Civilization {
  id: string;
  subredditId: string;
  name: string;
  seasonId: string;
  originStory: string;
  timeline: CivilizationTimelineEvent[];
  generatedAt: string;
}

export interface CivilizationTimelineEvent {
  id: string;
  civilizationId: string;
  era: "founding" | "war" | "golden_age" | "collapse" | "rediscovery";
  year: number;
  title: string;
  description: string;
  triggeredByArtifactId: string | null;
}

export type RoleId =
  | "archaeologist"
  | "historian"
  | "conservator"
  | "linguist"
  | "curator"
  | "cartographer"
  | "researcher"
  | "photographer"
  | "storyteller";

export interface UserRoleProgress {
  roleId: RoleId;
  level: number;
  xp: number;
  unlockedAbilities: string[];
}

export interface SedimentUser {
  id: string;
  redditUsername: string;
  redditId: string;
  avatarUrl: string | null;
  flair: string | null;
  level: number;
  xp: number;
  xpToNextLevel: number;
  rank: number;
  digEnergy: number;
  maxDigEnergy: number;
  nextEnergyAt: string | null;
  coins: number;
  gems: number;
  roles: UserRoleProgress[];
  activeRole: RoleId;
  createdAt: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
}

export interface Season {
  id: string;
  name: string;
  civilizationTheme: string;
  startsAt: string;
  endsAt: string;
  passTierMax: number;
}

export interface SeasonPassProgress {
  seasonId: string;
  userId: string;
  xp: number;
  tier: number;
  claimedTiers: number[];
}

export interface CommunityEvent {
  id: string;
  subredditId: string;
  type:
    | "sandstorm"
    | "earthquake"
    | "flood"
    | "hidden_tunnel"
    | "treasure_chamber"
    | "trap_mechanism"
    | "ancient_puzzle"
    | "rare_fossil"
    | "meteor_impact"
    | "legendary_discovery_hunt"
    | "double_restoration_weekend";
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  progress: number | null;
  goal: number | null;
}

export interface FeedItem {
  id: string;
  userId: string;
  username: string;
  role: RoleId;
  body: string;
  createdAt: string;
  upvotes: number;
  artifactId: string | null;
}

export interface Subreddit {
  id: string;
  name: string; // e.g. "r/history"
  civilizationId: string | null;
  totalDiggers: number;
  createdAt: string;
}

// ---- Websocket / realtime event payloads ----

export type RealtimeEventType =
  | "cell_updated"
  | "artifact_discovered"
  | "artifact_restored"
  | "legendary_discovery"
  | "layer_progress"
  | "feed_item"
  | "community_event_update";

export interface RealtimeEvent<T = unknown> {
  type: RealtimeEventType;
  subredditId: string;
  payload: T;
  timestamp: string;
}

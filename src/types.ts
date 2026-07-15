// Shared message types between the Devvit backend and the React WebView frontend.
// All messages are JSON-serializable.

/** Messages sent FROM the WebView (frontend) TO Devvit (backend) */
export type WebViewMessage =
  | { type: "webview_ready" }
  | { type: "dig_stroke"; layerId: string; toolId: ToolId; clearedDelta: number }
  | { type: "restore_artifact"; artifactId: string; qualityDelta: number }
  | { type: "discover_artifact"; artifactId: string }
  | { type: "add_lore"; artifactId: string; body: string }
  | { type: "vote_lore"; artifactId: string; loreId: string }
  | { type: "add_journal_entry"; body: string }
  | { type: "get_layer" }
  | { type: "get_artifacts" }
  | { type: "get_lore"; artifactId: string }
  | { type: "get_journal" };

/** Messages sent FROM Devvit (backend) TO the WebView (frontend) */
export type DevvitMessage =
  | { type: "initial_data"; username: string; subredditName: string; layer: DigLayerData | null; artifacts: ArtifactData[] }
  | { type: "layer_updated"; layer: DigLayerData }
  | { type: "artifact_updated"; artifact: ArtifactData }
  | { type: "lore_list"; artifactId: string; lore: LoreEntry[] }
  | { type: "journal_list"; entries: JournalEntry[] }
  | { type: "realtime_event"; event: RealtimeEvent }
  | { type: "error"; message: string };

// ---- Domain types ----

export type ToolId = "brush" | "pickaxe" | "fine_brush" | "air_blower" | "water_spray";
export type ArtifactStatus = "buried" | "excavated" | "in_restoration" | "restored" | "damaged";
export type ArtifactRarity = "common" | "uncommon" | "rare" | "legendary";
export type ArtifactCategory = "pottery" | "jewelry" | "weapon" | "fossil" | "scroll" | "statue" | "tool" | "coin";
export type ChamberType = "ruins" | "burial" | "throne" | "library" | "market" | "temple";

export interface DigLayerData {
  id: string;
  subredditId: string;
  index: number;
  name: string;
  progress: number; // 0-100
  chamberType: ChamberType;
  isRareChamber: boolean;
  diggerCount: number;
  unlockedAt: string;
}

export interface ArtifactData {
  id: string;
  subredditId: string;
  name: string;
  description: string;
  category: ArtifactCategory;
  rarity: ArtifactRarity;
  status: ArtifactStatus;
  condition: number; // 0-100
  discoveredBy: string | null;
  discoveredAt: string | null;
  imageUrl: string | null;
}

export interface LoreEntry {
  id: string;
  artifactId: string;
  author: string;
  body: string;
  votes: number;
  isOfficial: boolean;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

export interface RealtimeEvent {
  type: "layer_progress" | "artifact_discovered" | "legendary_discovery" | "artifact_restored";
  subredditId: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

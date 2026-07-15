// v0.0.3.15 — trigger upload with full webroot
import { Devvit, useState, useChannel } from "@devvit/public-api";
import type {
  WebViewMessage,
  DevvitMessage,
  DigLayerData,
  ArtifactData,
  LoreEntry,
  JournalEntry,
  RealtimeEvent,
} from "./types.js";

// ─── Configure Devvit plugins ────────────────────────────────────────────────
Devvit.configure({
  redditAPI: true,
  redis: true,
});

// ─── Redis key helpers ───────────────────────────────────────────────────────
const KEY = {
  layer: (subredditId: string) => `sediment:layer:${subredditId}`,
  artifacts: (subredditId: string) => `sediment:artifacts:${subredditId}`,
  artifact: (id: string) => `sediment:artifact:${id}`,
  lore: (artifactId: string) => `sediment:lore:${artifactId}`,
  journal: (subredditId: string) => `sediment:journal:${subredditId}`,
  diggerCount: (subredditId: string) => `sediment:diggers:${subredditId}`,
};

const CHANNEL = "sediment_events";

// ─── Seed data helpers ───────────────────────────────────────────────────────
function makeLayer(subredditId: string, index: number): DigLayerData {
  const chambers = ["ruins", "burial", "throne", "library", "market", "temple"] as const;
  return {
    id: `layer_${subredditId}_${index}`,
    subredditId,
    index,
    name: `The Sunken Courtyard (Layer ${index})`,
    progress: 0,
    chamberType: chambers[index % chambers.length],
    isRareChamber: index % 7 === 0,
    diggerCount: 0,
    unlockedAt: new Date().toISOString(),
  };
}

function makeArtifact(subredditId: string, idx: number): ArtifactData {
  const categories = ["pottery", "jewelry", "weapon", "fossil", "scroll", "statue", "tool", "coin"] as const;
  const rarities = ["common", "common", "uncommon", "uncommon", "rare", "legendary"] as const;
  const names = [
    "Bronze Ceremonial Mask",
    "Obsidian Shard",
    "Clay Tablet",
    "Sun Disk Amulet",
    "Iron Arrowhead",
    "Petrified Feather",
    "Trade Scroll",
    "Limestone Idol",
  ];
  return {
    id: `artifact_${subredditId}_${idx}`,
    subredditId,
    name: names[idx % names.length],
    description: "An ancient relic from a forgotten civilization, waiting to be studied.",
    category: categories[idx % categories.length],
    rarity: rarities[idx % rarities.length],
    status: idx === 0 ? "excavated" : "buried",
    condition: idx === 0 ? 75 : 0,
    discoveredBy: null,
    discoveredAt: null,
    imageUrl: null,
  };
}

// ─── Ensure subreddit has seed data in Redis ─────────────────────────────────
async function ensureSubredditData(context: Devvit.Context, subredditId: string) {
  const { redis } = context;

  // Check if layer already exists
  const existing = await redis.get(KEY.layer(subredditId));
  if (existing) return;

  // Seed layer 1
  const layer = makeLayer(subredditId, 1);
  await redis.set(KEY.layer(subredditId), JSON.stringify(layer));

  // Seed 8 starter artifacts
  const artifacts: ArtifactData[] = [];
  for (let i = 0; i < 8; i++) {
    const a = makeArtifact(subredditId, i);
    artifacts.push(a);
    await redis.set(KEY.artifact(a.id), JSON.stringify(a));
  }
  await redis.set(KEY.artifacts(subredditId), JSON.stringify(artifacts.map((a) => a.id)));
}

// ─── Get all artifacts for subreddit ─────────────────────────────────────────
async function getArtifacts(context: Devvit.Context, subredditId: string): Promise<ArtifactData[]> {
  const { redis } = context;
  const idsJson = await redis.get(KEY.artifacts(subredditId));
  if (!idsJson) return [];
  const ids: string[] = JSON.parse(idsJson);
  const artifacts: ArtifactData[] = [];
  for (const id of ids) {
    const raw = await redis.get(KEY.artifact(id));
    if (raw) artifacts.push(JSON.parse(raw) as ArtifactData);
  }
  return artifacts;
}

// ─── Broadcast a realtime event to subreddit subscribers ─────────────────────
async function broadcast(context: Devvit.Context, subredditId: string, event: RealtimeEvent) {
  try {
    await context.realtime.send(CHANNEL, event as any);
  } catch {
    // Realtime is best-effort; swallow errors so game is not disrupted
  }
}

// ─── Main Devvit app ──────────────────────────────────────────────────────────
Devvit.addCustomPostType({
  name: "Sediment Dig Site",
  description: "Community archaeology game",
  height: "tall",

  render: (context) => {
    const [webviewVisible, setWebviewVisible] = useState(false);

    const channel = useChannel({
      name: "sediment_events",
      onMessage: (msg) => {
        context.ui.webView.postMessage("sediment-webview", {
          type: "realtime_event",
          event: msg,
        } as any);
      },
    });
    channel.subscribe();

    // ── Handle messages coming FROM the WebView ──────────────────────────────
    async function onMessage(msg: WebViewMessage) {
      const { reddit, redis, realtime } = context;

      // Get subreddit info
      // Hack to avoid `invalid comment media type: video` bug in @devvit/public-api 0.11
      const subName = context.subredditName || "unknown_subreddit";
      const subredditId = `r_${subName}`;
      const currentUser = await reddit.getCurrentUser();
      const username = currentUser?.username ?? "anonymous";

      switch (msg.type) {
        // ── Initial handshake: WebView loaded, send all state ──
        case "webview_ready": {
          await ensureSubredditData(context, subredditId);

          const layerRaw = await redis.get(KEY.layer(subredditId));
          const layer = layerRaw ? (JSON.parse(layerRaw) as DigLayerData) : null;
          const artifacts = await getArtifacts(context, subredditId);


          const reply: DevvitMessage = {
            type: "initial_data",
            username,
            subredditName: subName,
            layer,
            artifacts,
          };
          context.ui.webView.postMessage("sediment-webview", reply as any);
          break;
        }

        // ── Record an excavation stroke ──
        case "dig_stroke": {
          const { layerId, clearedDelta } = msg;

          const layerRaw = await redis.get(KEY.layer(subredditId));
          if (!layerRaw) break;

          const layer = JSON.parse(layerRaw) as DigLayerData;
          if (layer.id !== layerId) break;

          layer.progress = Math.min(100, layer.progress + clearedDelta * 100);
          layer.diggerCount = (layer.diggerCount ?? 0) + 1;
          await redis.set(KEY.layer(subredditId), JSON.stringify(layer));

          // If progress hits 100, reveal buried artifact & advance layer
          if (layer.progress >= 100) {
            const artifacts = await getArtifacts(context, subredditId);
            const buried = artifacts.find((a) => a.status === "buried");
            if (buried) {
              buried.status = "excavated";
              buried.discoveredBy = username;
              buried.discoveredAt = new Date().toISOString();
              buried.condition = 60 + Math.floor(Math.random() * 40);
              await redis.set(KEY.artifact(buried.id), JSON.stringify(buried));

              const eventType = buried.rarity === "legendary" ? "legendary_discovery" : "artifact_discovered";
              await broadcast(context, subredditId, {
                type: eventType,
                subredditId,
                payload: { artifactId: buried.id, name: buried.name, discoveredBy: username },
                timestamp: new Date().toISOString(),
              });

              // Advance to next layer
              const nextLayer = makeLayer(subredditId, layer.index + 1);
              await redis.set(KEY.layer(subredditId), JSON.stringify(nextLayer));
            }
          } else {
            // Broadcast progress update
            await broadcast(context, subredditId, {
              type: "layer_progress",
              subredditId,
              payload: { layerId, progress: layer.progress },
              timestamp: new Date().toISOString(),
            });
          }

          // Send updated layer back to this WebView immediately
          const updatedLayerRaw = await redis.get(KEY.layer(subredditId));
          if (updatedLayerRaw) {
            context.ui.webView.postMessage("sediment-webview", {
              type: "layer_updated",
              layer: JSON.parse(updatedLayerRaw) as DigLayerData,
            } as any);
          }
          break;
        }

        // ── Restore an artifact ──
        case "restore_artifact": {
          const { artifactId, qualityDelta } = msg;
          const raw = await redis.get(KEY.artifact(artifactId));
          if (!raw) break;

          const artifact = JSON.parse(raw) as ArtifactData;
          artifact.condition = Math.max(0, Math.min(100, artifact.condition + qualityDelta));
          artifact.status =
            artifact.condition >= 100
              ? "restored"
              : artifact.condition <= 0
                ? "damaged"
                : "in_restoration";
          await redis.set(KEY.artifact(artifactId), JSON.stringify(artifact));

          if (artifact.status === "restored") {
            await broadcast(context, subredditId, {
              type: "artifact_restored",
              subredditId,
              payload: { artifactId, restoredBy: username },
              timestamp: new Date().toISOString(),
            });
          }

          context.ui.webView.postMessage("sediment-webview", {
            type: "artifact_updated",
            artifact,
          } as any);
          break;
        }

        // ── Add community lore to an artifact ──
        case "add_lore": {
          const { artifactId, body } = msg;
          const loreRaw = await redis.get(KEY.lore(artifactId));
          const lore: LoreEntry[] = loreRaw ? JSON.parse(loreRaw) : [];
          const entry: LoreEntry = {
            id: `lore_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            artifactId,
            author: username,
            body,
            votes: 1,
            isOfficial: lore.length === 0,
            createdAt: new Date().toISOString(),
          };
          lore.unshift(entry);
          await redis.set(KEY.lore(artifactId), JSON.stringify(lore));

          context.ui.webView.postMessage("sediment-webview", {
            type: "lore_list",
            artifactId,
            lore,
          } as any);
          break;
        }

        // ── Upvote a lore entry ──
        case "vote_lore": {
          const { artifactId, loreId } = msg;
          const loreRaw = await redis.get(KEY.lore(artifactId));
          if (!loreRaw) break;
          const lore: LoreEntry[] = JSON.parse(loreRaw);
          const updated = lore.map((e) => (e.id === loreId ? { ...e, votes: e.votes + 1 } : e));
          // Mark most-voted as official
          const topVotes = Math.max(...updated.map((e) => e.votes));
          updated.forEach((e) => (e.isOfficial = e.votes === topVotes));
          await redis.set(KEY.lore(artifactId), JSON.stringify(updated));

          context.ui.webView.postMessage("sediment-webview", {
            type: "lore_list",
            artifactId,
            lore: updated,
          } as any);
          break;
        }

        // ── Fetch lore for an artifact ──
        case "get_lore": {
          const { artifactId } = msg;
          const loreRaw = await redis.get(KEY.lore(artifactId));
          const lore: LoreEntry[] = loreRaw ? JSON.parse(loreRaw) : [];
          context.ui.webView.postMessage("sediment-webview", {
            type: "lore_list",
            artifactId,
            lore,
          } as any);
          break;
        }

        // ── Add a journal entry ──
        case "add_journal_entry": {
          const journalRaw = await redis.get(KEY.journal(subredditId));
          const journal: JournalEntry[] = journalRaw ? JSON.parse(journalRaw) : [];
          const entry: JournalEntry = {
            id: `journal_${Date.now()}`,
            author: username,
            body: msg.body,
            createdAt: new Date().toISOString(),
          };
          journal.unshift(entry);
          // Keep last 500 entries
          if (journal.length > 500) journal.length = 500;
          await redis.set(KEY.journal(subredditId), JSON.stringify(journal));

          context.ui.webView.postMessage("sediment-webview", {
            type: "journal_list",
            entries: journal.slice(0, 50),
          } as any);
          break;
        }

        // ── Fetch journal ──
        case "get_journal": {
          const journalRaw = await redis.get(KEY.journal(subredditId));
          const journal: JournalEntry[] = journalRaw ? JSON.parse(journalRaw) : [];
          context.ui.webView.postMessage("sediment-webview", {
            type: "journal_list",
            entries: journal.slice(0, 50),
          } as any);
          break;
        }

        // ── Fetch artifacts ──
        case "get_artifacts": {
          const artifacts = await getArtifacts(context, subredditId);
          const layerRaw = await redis.get(KEY.layer(subredditId));
          const layer = layerRaw ? (JSON.parse(layerRaw) as DigLayerData) : null;
          context.ui.webView.postMessage("sediment-webview", {
            type: "initial_data",
            username,
            subredditName: subName,
            layer,
            artifacts,
          } as any);
          break;
        }

        // ── Fetch layer ──
        case "get_layer": {
          const layerRaw = await redis.get(KEY.layer(subredditId));
          if (layerRaw) {
            context.ui.webView.postMessage("sediment-webview", {
              type: "layer_updated",
              layer: JSON.parse(layerRaw) as DigLayerData,
            } as any);
          }
          break;
        }

        default:
          break;
      }
    }



    // ── Render ── DIAGNOSTIC: bare minimum webview test ──────────────────────
    return (
      <vstack height="100%" width="100%" padding="none">
        <webview
          id="sediment-webview"
          url="index.html"
          onMessage={(msg) => onMessage(msg as WebViewMessage)}
          grow
          width="100%"
          height="100%"
        />
      </vstack>
    );
  },
});

// ─── Menu action to create a new Sediment post ───────────────────────────────
Devvit.addMenuItem({
  label: "🏺 Start a Sediment Dig",
  location: "subreddit",
  onPress: async (_event, context) => {
    // Hack to avoid `invalid comment media type: video` bug in @devvit/public-api 0.11
    const subName = context.subredditName || "unknown_subreddit";
    const post = await context.reddit.submitPost({
      title: `r/${subName} Community Dig — The Excavation Begins!`,
      subredditName: subName,
      preview: (
        <vstack grow alignment="middle center" padding="large">
          <text size="xlarge" weight="bold">
            🏺 Sediment
          </text>
          <text size="medium" color="neutral-content-weak">
            Loading your dig site…
          </text>
        </vstack>
      ),
    } as any);
    context.ui.showToast("✅ Sediment dig post created!");
    context.ui.navigateTo(post);
  },
});

export default Devvit;

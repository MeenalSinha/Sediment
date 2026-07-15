import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useSedimentStore } from "@/lib/store";
import { bridge } from "@/lib/devvit-bridge";
import type { DevvitMessage } from "../../../src/types.js";
import type { Artifact, DigLayer } from "@sediment/shared";
import { demoUser } from "@/lib/mockData";

/**
 * App.tsx — Devvit WebView edition
 *
 * Authentication is handled by Devvit automatically. When the WebView loads,
 * we call bridge.init() which sends `webview_ready` to the Devvit backend.
 * The backend responds with `initial_data` containing the logged-in username.
 */
export default function App() {
  const setUser = useSedimentStore((s) => s.setUser);
  const setActiveLayer = useSedimentStore((s) => s.setActiveLayer);
  const setArtifacts = useSedimentStore((s) => s.setArtifacts);
  const user = useSedimentStore((s) => s.user);
  const recordDiscovery = useSedimentStore((s) => s.recordDiscovery);
  const restoreArtifact = useSedimentStore((s) => s.restoreArtifact);
  const pushFeedItem = useSedimentStore((s) => s.pushFeedItem);

  useEffect(() => {
    // ── Initialize bridge: tell Devvit the webview is ready ──────────────────
    bridge.init();

    // ── Handle initial data from Devvit backend ───────────────────────────────
    const offInit = bridge.on("initial_data", (msg: Extract<DevvitMessage, { type: "initial_data" }>) => {
      // Set user from Devvit-provided Reddit username
      setUser({
        id: msg.username,
        redditUsername: msg.username,
        redditId: `u_${msg.username}`,
        avatarUrl: `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png`,
        flair: null,
        level: 1,
        xp: 0,
        xpToNextLevel: 1000,
        rank: 100,
        digEnergy: 100,
        maxDigEnergy: 100,
        nextEnergyAt: null,
        coins: 50,
        gems: 10,
        roles: [],
        activeRole: "archaeologist",
        createdAt: new Date().toISOString(),
      } as any); // cast to any because we dropped subredditId and role from SedimentUser in types but it might still exist in some types

      // Set dig layer
      if (msg.layer) {
        const layer: DigLayer = {
          id: msg.layer.id,
          subredditId: msg.layer.subredditId,
          index: msg.layer.index,
          name: msg.layer.name,
          progress: msg.layer.progress,
          chamberType: msg.layer.chamberType as DigLayer["chamberType"],
          isRareChamber: msg.layer.isRareChamber,
          unlockedAt: msg.layer.unlockedAt,
        };
        setActiveLayer(layer);
      }

      // Set artifacts
      const artifacts: Artifact[] = msg.artifacts.map((a) => ({
        id: a.id,
        subredditId: a.subredditId,
        name: a.name,
        description: a.description,
        category: a.category as Artifact["category"],
        rarity: a.rarity as Artifact["rarity"],
        status: a.status as Artifact["status"],
        condition: a.condition,
        discoveredBy: a.discoveredBy ?? [],
        discoveredAt: a.discoveredAt ?? undefined,
        imageUrl: a.imageUrl ?? undefined,
        layerId: msg.layer?.id ?? "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setArtifacts(artifacts);

      // Set the first excavated artifact as the current discovery
      const firstExcavated = artifacts.find((a) => a.status === "excavated");
      if (firstExcavated) recordDiscovery(firstExcavated);
    });

    // ── Handle layer updates (from digging) ───────────────────────────────────
    const offLayer = bridge.on("layer_updated", (msg) => {
      const layer: DigLayer = {
        id: msg.layer.id,
        subredditId: msg.layer.subredditId,
        index: msg.layer.index,
        name: msg.layer.name,
        progress: msg.layer.progress,
        chamberType: msg.layer.chamberType as DigLayer["chamberType"],
        isRareChamber: msg.layer.isRareChamber,
        unlockedAt: msg.layer.unlockedAt,
      };
      setActiveLayer(layer);
    });

    // ── Handle artifact updates (restoration, discovery) ─────────────────────
    const offArtifact = bridge.on("artifact_updated", (msg) => {
      const a = msg.artifact;
      restoreArtifact(a.id, 0); // trigger re-render; actual delta already applied server-side
    });

    // ── Handle realtime events from other users digging ───────────────────────
    const offRealtime = bridge.on("realtime_event", (msg) => {
      const { event } = msg;
      if (event.type === "artifact_discovered" || event.type === "legendary_discovery") {
        pushFeedItem({
          id: crypto.randomUUID(),
          userId: String(event.payload.discoveredBy ?? "unknown"),
          username: String(event.payload.discoveredBy ?? "unknown"),
          role: "archaeologist",
          body: `Discovered: ${event.payload.name}`,
          createdAt: event.timestamp,
          upvotes: 0,
          artifactId: String(event.payload.artifactId ?? ""),
        });
      }
    });

    return () => {
      offInit();
      offLayer();
      offArtifact();
      offRealtime();
    };
  }, [setUser, setActiveLayer, setArtifacts, recordDiscovery, restoreArtifact, pushFeedItem]);

  // Show loading state while waiting for Devvit initial_data
  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-stone-950 text-center text-sand-100">
        <h1 className="font-display text-4xl font-bold tracking-widest text-gold-300">SEDIMENT</h1>
        <p className="text-sm tracking-widest text-sand-400">Uncover. Restore. Remember.</p>
        <div className="mt-2 h-1 w-48 overflow-hidden rounded-full bg-stone-800">
          <div className="h-full w-full animate-pulse rounded-full bg-gold-500/60" />
        </div>
        <p className="text-xs text-stone-600 mb-4">Loading your subreddit's dig site…</p>
        
        {/* Fallback for local development */}
        {import.meta.env.DEV && (
          <button 
            onClick={() => setUser(demoUser)}
            className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md text-sm font-semibold transition-colors shadow-sm"
          >
            View Demo
          </button>
        )}
      </div>
    );
  }

  return <AppShell />;
}

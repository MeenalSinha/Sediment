import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ToolsPanel } from "@/components/ToolsPanel";
import { DigSitePanel } from "@/components/DigSitePanel";
import { CurrentDiscoveryPanel } from "@/components/CurrentDiscoveryPanel";
import { LiveDiscussionsPanel } from "@/components/LiveDiscussionsPanel";
import { SeasonPassPanel } from "@/components/SeasonPassPanel";
import { MuseumCollectionBar } from "@/components/MuseumCollectionBar";
import { Modal } from "@/components/Modal";
import { MapModal } from "@/components/MapModal";
import { ArtifactDetailModal } from "@/components/ArtifactDetailModal";
import { RestorationGame } from "@/components/RestorationGame";
import { useSedimentStore } from "@/lib/store";
import { demoCategories, demoSeason, demoSeasonPassProgress } from "@/lib/mockData";
import { sfx } from "@/lib/sound";
import type { DigLayer } from "@sediment/shared";

export function DigSitePage() {
  const user = useSedimentStore((s) => s.user);
  const currentDiscovery = useSedimentStore((s) => s.currentDiscovery);
  const feed = useSedimentStore((s) => s.feed);
  const pushFeedItem = useSedimentStore((s) => s.pushFeedItem);
  const restoreArtifact = useSedimentStore((s) => s.restoreArtifact);
  const loreByArtifact = useSedimentStore((s) => s.loreByArtifact);
  const addLore = useSedimentStore((s) => s.addLore);
  const voteLore = useSedimentStore((s) => s.voteLore);
  const artifacts = useSedimentStore((s) => s.artifacts);
  const claimedTiers = useSedimentStore((s) => s.claimedTiers);
  const claimTier = useSedimentStore((s) => s.claimTier);
  const setActivePage = useSedimentStore((s) => s.setActivePage);
  const grantRoleXp = useSedimentStore((s) => s.grantRoleXp);
  const activeRole = useSedimentStore((s) => s.activeRole);
  const pushToast = useSedimentStore((s) => s.pushToast);

  const [mapOpen, setMapOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [restorationOpen, setRestorationOpen] = useState(false);
  const [currentChamber, setCurrentChamber] = useState("ruins");
  const [discoveryDismissed, setDiscoveryDismissed] = useState(false);

  // Keyboard shortcuts: 1-5 switch tools without a mouse (accessibility).
  const setActiveTool = useSedimentStore((s) => s.setActiveTool);
  useEffect(() => {
    const TOOL_KEYS = ["brush", "pickaxe", "fine_brush", "air_blower", "water_spray"] as const;
    function onKeyDown(e: KeyboardEvent) {
      const idx = Number(e.key) - 1;
      if (idx >= 0 && idx < TOOL_KEYS.length) setActiveTool(TOOL_KEYS[idx]);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setActiveTool]);

  if (!user || !currentDiscovery) {
    return <div className="flex flex-1 items-center justify-center text-sand-400">Loading dig site…</div>;
  }

  const discovered = artifacts.filter((a) => a.status !== "buried").length;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
    >
      <div className="flex flex-1 flex-col gap-4 lg:flex-row">
        <ToolsPanel />

        <DigSitePanel
          layer={{
            id: "layer_7",
            subredditId: "r_history",
            index: 7,
            name: "The Sunken Courtyard",
            unlockedAt: new Date().toISOString(),
            progress: 63,
            chamberType: currentChamber as DigLayer["chamberType"],
            isRareChamber: false,
          }}
          diggerCount={8742}
          artifactImageUrl={
            "data:image/svg+xml;utf8," +
            encodeURIComponent(
              `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
                 <circle cx='200' cy='150' r='90' fill='#4a7a72' />
                 <circle cx='165' cy='130' r='16' fill='#1b1f28' />
                 <circle cx='235' cy='130' r='16' fill='#1b1f28' />
                 <rect x='120' y='210' width='160' height='40' rx='10' fill='#3a4152' />
               </svg>`,
            )
          }
          onOpenMap={() => {
            sfx.click();
            setMapOpen(true);
          }}
          onOpenLiveFeed={() => setActivePage("events")}
          activeDiggerAvatars={new Array(9).fill("")}
        />

        <div className="flex flex-col gap-4 lg:w-80">
          {discoveryDismissed ? (
            <button
              onClick={() => setDiscoveryDismissed(false)}
              className="rounded-xl border border-dashed border-stone-700 bg-stone-900/50 p-4 text-center text-sm text-sand-500 hover:border-gold-500/50 hover:text-sand-300"
            >
              Discovery panel dismissed — click to bring it back
            </button>
          ) : (
            <CurrentDiscoveryPanel
              artifact={currentDiscovery}
              onClose={() => setDiscoveryDismissed(true)}
              onSendToRestoration={() => {
                sfx.click();
                setRestorationOpen(true);
              }}
              onViewDetails={() => {
                sfx.click();
                setDetailOpen(true);
              }}
            />
          )}
          <LiveDiscussionsPanel
            items={feed}
            onSeeAll={() => setActivePage("events")}
            onAddLore={() => {
              sfx.click();
              setDetailOpen(true);
            }}
          />
          <SeasonPassPanel
            season={demoSeason}
            progress={{ ...demoSeasonPassProgress, claimedTiers }}
            onOpenPass={() => {
              if (!claimedTiers.includes(demoSeasonPassProgress.tier)) {
                claimTier(demoSeasonPassProgress.tier);
                pushToast({
                  kind: "info",
                  title: "Season Reward Claimed",
                  body: `Tier ${demoSeasonPassProgress.tier} reward collected.`,
                });
              } else {
                pushToast({ kind: "info", title: "Already Claimed", body: "Keep excavating to reach the next tier." });
              }
            }}
          />
        </div>
      </div>

      <MuseumCollectionBar
        discovered={discovered}
        total={248}
        categories={demoCategories}
        onViewMuseum={() => setActivePage("museum")}
      />

      <MapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        currentChamber={currentChamber}
        onSelectChamber={(chamber) => {
          setCurrentChamber(chamber);
          setMapOpen(false);
          pushToast({ kind: "info", title: "Chamber Selected", body: `Now excavating: ${chamber.replace("_", " ")}` });
        }}
      />

      <ArtifactDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        artifact={currentDiscovery}
        lore={loreByArtifact[currentDiscovery.id] ?? []}
        onVote={(loreId) => voteLore(currentDiscovery.id, loreId)}
        onSubmitLore={(body) => {
          addLore(currentDiscovery.id, user.redditUsername, body);
          grantRoleXp("storyteller", 25);
          pushFeedItem({
            id: crypto.randomUUID(),
            userId: user.id,
            username: user.redditUsername,
            role: activeRole,
            body,
            createdAt: new Date().toISOString(),
            upvotes: 1,
            artifactId: currentDiscovery.id,
          });
        }}
      />

      <Modal open={restorationOpen} onClose={() => setRestorationOpen(false)} title="Restoration" width="md">
        <RestorationGame
          artifactName={currentDiscovery.name}
          onCancel={() => setRestorationOpen(false)}
          onComplete={(qualityDelta) => {
            restoreArtifact(currentDiscovery.id, qualityDelta);
            grantRoleXp("conservator", 40);
            pushToast({
              kind: "info",
              title: qualityDelta >= 0 ? "Restoration Improved Condition" : "Restoration Caused Damage",
              body: `${qualityDelta >= 0 ? "+" : ""}${qualityDelta}% condition`,
            });
            setRestorationOpen(false);
          }}
        />
      </Modal>
    </motion.main>
  );
}

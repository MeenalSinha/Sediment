import { lazy, Suspense, useEffect, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Sidebar } from "@/components/Sidebar";
import { BottomEventBar } from "@/components/BottomEventBar";
import { RankingsModal } from "@/components/RankingsModal";
import { SettingsModal } from "@/components/SettingsModal";
import { ToastStack } from "@/components/ToastStack";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FullScreenSkeleton, PageSkeleton } from "@/components/PageSkeleton";
import { useSedimentStore } from "@/lib/store";
import {
  demoCommunityGoalEvent,
  demoDiscoveryQueue,
  demoFeed,
  demoGlobalEvent,
  demoLayer,
  demoLeaderboard,
  demoMuseumArtifacts,
  demoUser,
} from "@/lib/mockData";

// Every page after the first is a separate lazy chunk — Phaser (packages/game) only
// loads once the Dig Site page actually mounts, and each secondary page (Museum,
// Journal, etc.) is fetched on first visit rather than bundled into the initial load.
const DigSitePage = lazy(() => import("@/pages/DigSite").then((m) => ({ default: m.DigSitePage })));
const MuseumPage = lazy(() => import("@/pages/MuseumPage").then((m) => ({ default: m.MuseumPage })));
const JournalPage = lazy(() => import("@/pages/JournalPage").then((m) => ({ default: m.JournalPage })));
const CivilizationPage = lazy(() => import("@/pages/CivilizationPage").then((m) => ({ default: m.CivilizationPage })));
const RolesPage = lazy(() => import("@/pages/RolesPage").then((m) => ({ default: m.RolesPage })));
const EventsPage = lazy(() => import("@/pages/EventsPage").then((m) => ({ default: m.EventsPage })));
const ShopPage = lazy(() => import("@/pages/ShopPage").then((m) => ({ default: m.ShopPage })));

const PAGE_LABELS: Record<string, string> = {
  dig_site: "Dig Site",
  museum: "Museum",
  journal: "Journal",
  civilization: "Civilization",
  roles: "Roles",
  events: "Events",
  shop: "Shop",
};

export function AppShell() {
  const user = useSedimentStore((s) => s.user);
  const activePage = useSedimentStore((s) => s.activePage);
  const setActivePage = useSedimentStore((s) => s.setActivePage);
  const settings = useSedimentStore((s) => s.settings);
  const setUser = useSedimentStore((s) => s.setUser);
  const setActiveLayer = useSedimentStore((s) => s.setActiveLayer);
  const setArtifacts = useSedimentStore((s) => s.setArtifacts);
  const pushFeedItem = useSedimentStore((s) => s.pushFeedItem);
  const setCurrentDiscovery = useSedimentStore((s) => s.setCurrentDiscovery);
  const setDiscoveryQueue = useSedimentStore((s) => s.setDiscoveryQueue);

  const [rankingsOpen, setRankingsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setUser(demoUser);
    setActiveLayer(demoLayer);
    setArtifacts(demoMuseumArtifacts);
    setDiscoveryQueue(demoDiscoveryQueue);
    demoFeed.forEach(pushFeedItem);
    // The mask fragment is already "excavated" in the reference screenshot — seed it quietly as the
    // current discovery (no toast/sfx/achievement fanfare on page load; those fire on real discoveries).
    setCurrentDiscovery(demoMuseumArtifacts[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return <FullScreenSkeleton />;
  }

  const rootClasses = [
    "flex h-screen flex-col bg-stone-950 text-sand-100",
    settings.colorblindMode ? "saturate-[0.6] contrast-125" : "",
    settings.reducedMotion ? "reduced-motion" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClasses}>
      <TopBar
        user={user}
        onOpenShop={() => setActivePage("shop")}
        onOpenMenu={() => setSettingsOpen(true)}
        onToggleMobileNav={() => setMobileNavOpen((v) => !v)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          active={activePage}
          onSelect={(id) => {
            setActivePage(id as typeof activePage);
            setMobileNavOpen(false);
          }}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        <ErrorBoundary key={activePage} fallbackLabel={PAGE_LABELS[activePage]}>
          <Suspense fallback={<PageSkeleton />}>
            {activePage === "dig_site" && <DigSitePage />}
            {activePage === "museum" && <MuseumPage />}
            {activePage === "journal" && <JournalPage />}
            {activePage === "civilization" && <CivilizationPage />}
            {activePage === "roles" && <RolesPage />}
            {activePage === "events" && <EventsPage />}
            {activePage === "shop" && <ShopPage />}
          </Suspense>
        </ErrorBoundary>
      </div>

      <BottomEventBar
        globalEvent={demoGlobalEvent}
        communityGoalEvent={demoCommunityGoalEvent}
        onOpenRankings={() => setRankingsOpen(true)}
        onOpenAchievements={() => setActivePage("events")}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <RankingsModal
        open={rankingsOpen}
        onClose={() => setRankingsOpen(false)}
        entries={demoLeaderboard}
        currentUsername={user.redditUsername}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ToastStack />
    </div>
  );
}

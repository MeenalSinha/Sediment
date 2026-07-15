import { Landmark, BookOpen, Wrench, Languages, Gem, Map, Search, Camera, Feather } from "lucide-react";
import { Panel, ProgressBar, Button } from "@sediment/ui";
import { ROLE_LABELS } from "@sediment/shared";
import type { RoleId } from "@sediment/shared";
import { useSedimentStore } from "@/lib/store";

const ROLE_ICON: Record<RoleId, typeof Landmark> = {
  archaeologist: Search,
  historian: BookOpen,
  conservator: Wrench,
  linguist: Languages,
  curator: Landmark,
  cartographer: Map,
  researcher: Gem,
  photographer: Camera,
  storyteller: Feather,
};

const ROLE_ABILITY: Record<RoleId, string> = {
  archaeologist: "Faster excavation on ruins and hidden caves.",
  historian: "See a preview of an artifact's likely period before it's fully revealed.",
  conservator: "Restoration mini-game mistakes cost less condition.",
  linguist: "AI inscription translations are more detailed.",
  curator: "Can promote lore to official without a full community vote at high level.",
  cartographer: "Reveals one extra fogged chamber on the excavation map.",
  researcher: "Bonus XP for artifacts matching your role's specialty.",
  photographer: "Museum entries you discover get a featured placard.",
  storyteller: "Lore submissions get a small starting vote boost.",
};

const ALL_ROLES: RoleId[] = [
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

export function RolesPage() {
  const roleProgress = useSedimentStore((s) => s.roleProgress);
  const activeRole = useSedimentStore((s) => s.activeRole);
  const setActiveRole = useSedimentStore((s) => s.setActiveRole);

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
      <Panel eyebrow="Progression" title="Roles">
        <p className="text-sm text-sand-400">
          Level up any role by doing the kind of work it represents — excavating, restoring, translating, cataloguing,
          mapping, researching, photographing, or writing lore. Your active role's perks apply everywhere.
        </p>
      </Panel>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_ROLES.map((role) => {
          const Icon = ROLE_ICON[role];
          const progress = roleProgress[role];
          const xpIntoLevel = progress.xp % 500;
          const isActive = activeRole === role;

          return (
            <div
              key={role}
              className={`rounded-xl border p-4 shadow-panel ${isActive ? "border-gold-500/60 bg-gold-500/5" : "border-stone-700/60 bg-stone-900/70"}`}
            >
              <div className="mb-2 flex items-center gap-2.5">
                <Icon size={20} className="text-bronze-400" />
                <div>
                  <p className="text-sm font-bold text-sand-50">{ROLE_LABELS[role]}</p>
                  <p className="text-[11px] text-sand-500">Level {progress.level}</p>
                </div>
              </div>
              <ProgressBar value={(xpIntoLevel / 500) * 100} color="gold" height="sm" />
              <p className="mt-2 text-xs text-sand-400">{ROLE_ABILITY[role]}</p>
              <Button
                variant={isActive ? "gold" : "secondary"}
                size="sm"
                className="mt-3 w-full"
                onClick={() => setActiveRole(role)}
                disabled={isActive}
              >
                {isActive ? "Active Role" : "Set as Active"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

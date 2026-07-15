import type { AchievementDefinition, RoleId } from "../types/domain";

export const ROLE_LABELS: Record<RoleId, string> = {
  archaeologist: "Archaeologist",
  historian: "Historian",
  conservator: "Conservator",
  linguist: "Linguist",
  curator: "Curator",
  cartographer: "Cartographer",
  researcher: "Researcher",
  photographer: "Photographer",
  storyteller: "Storyteller",
};

export const ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "first_discovery", name: "First Discovery", description: "Uncover your first artifact.", icon: "sparkles" },
  { id: "master_conservator", name: "Master Conservator", description: "Fully restore 25 artifacts.", icon: "wrench" },
  { id: "legend_hunter", name: "Legend Hunter", description: "Contribute to a legendary discovery.", icon: "gem" },
  {
    id: "museum_founder",
    name: "Museum Founder",
    description: "Be among the first 100 diggers of a civilization.",
    icon: "landmark",
  },
  {
    id: "perfect_restoration",
    name: "Perfect Restoration",
    description: "Restore an artifact to 100% condition.",
    icon: "star",
  },
  {
    id: "hundred_artifacts",
    name: "100 Artifacts",
    description: "Discover 100 artifacts community-wide.",
    icon: "layers",
  },
  { id: "rare_fossil", name: "Rare Fossil", description: "Uncover a rare fossil.", icon: "bone" },
  {
    id: "community_favorite",
    name: "Community Favorite",
    description: "Have your lore entry voted official.",
    icon: "heart",
  },
];

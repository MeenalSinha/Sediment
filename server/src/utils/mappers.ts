import type { SedimentUser } from "@sediment/shared";
import type { UserRow } from "../db/usersRepo";

export function mapUserRow(row: UserRow): SedimentUser {
  return {
    id: row.id,
    redditUsername: row.reddit_username,
    redditId: row.reddit_id,
    avatarUrl: row.avatar_url,
    flair: row.flair,
    level: row.level,
    xp: row.xp,
    xpToNextLevel: row.xp_to_next_level,
    rank: 0,
    digEnergy: row.dig_energy,
    maxDigEnergy: row.max_dig_energy,
    nextEnergyAt: row.next_energy_at,
    coins: Number(row.coins),
    gems: Number(row.gems),
    roles: [],
    activeRole: row.active_role as SedimentUser["activeRole"],
    createdAt: row.created_at,
  };
}

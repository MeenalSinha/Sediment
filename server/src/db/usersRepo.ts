import { query } from "./pool";

export interface UserRow {
  id: string;
  reddit_id: string;
  reddit_username: string;
  avatar_url: string | null;
  flair: string | null;
  level: number;
  xp: number;
  xp_to_next_level: number;
  dig_energy: number;
  max_dig_energy: number;
  next_energy_at: string | null;
  coins: string;
  gems: string;
  active_role: string;
  created_at: string;
}

export async function upsertUserFromReddit(params: {
  redditId: string;
  redditUsername: string;
  avatarUrl: string | null;
}): Promise<UserRow> {
  const { rows } = await query<UserRow>(
    `INSERT INTO users (reddit_id, reddit_username, avatar_url)
     VALUES ($1, $2, $3)
     ON CONFLICT (reddit_id)
     DO UPDATE SET reddit_username = EXCLUDED.reddit_username, avatar_url = EXCLUDED.avatar_url, updated_at = now()
     RETURNING *`,
    [params.redditId, params.redditUsername, params.avatarUrl],
  );
  return rows[0];
}

export async function findUserById(userId: string): Promise<UserRow | null> {
  const { rows } = await query<UserRow>(`SELECT * FROM users WHERE id = $1`, [userId]);
  return rows[0] ?? null;
}

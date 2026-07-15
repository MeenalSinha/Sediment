import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { query } from "../db/pool";

export const museumRouter = Router();

// GET /api/museum/:subredditId/collection — per-category discovered/total tallies.
museumRouter.get(
  "/:subredditId/collection",
  asyncHandler(async (req, res) => {
    const { rows } = await query<{ category: string; discovered: string; total: string }>(
      `SELECT category,
              COUNT(*) FILTER (WHERE status IN ('excavated','in_restoration','restored')) AS discovered,
              COUNT(*) AS total
       FROM artifacts
       WHERE subreddit_id = $1
       GROUP BY category`,
      [req.params.subredditId],
    );

    res.json(
      rows.map((r) => ({
        category: r.category,
        discovered: Number(r.discovered),
        total: Number(r.total),
      })),
    );
  }),
);

// GET /api/museum/:subredditId/timeline — the civilization's evolving timeline.
museumRouter.get(
  "/:subredditId/timeline",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT cte.*
       FROM civilization_timeline_events cte
       JOIN civilizations c ON c.id = cte.civilization_id
       WHERE c.subreddit_id = $1
       ORDER BY cte.year ASC`,
      [req.params.subredditId],
    );
    res.json(rows);
  }),
);

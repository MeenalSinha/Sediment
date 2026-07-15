import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { query } from "../db/pool";
import { generateCivilization } from "../ai/client";
import { HttpError } from "../middleware/errorHandler";

export const civilizationRouter = Router();

// GET /api/civilization/:subredditId
civilizationRouter.get(
  "/:subredditId",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT c.*, s.name AS subreddit_name
       FROM civilizations c
       JOIN subreddits s ON s.id = c.subreddit_id
       WHERE c.subreddit_id = $1
       ORDER BY c.generated_at DESC
       LIMIT 1`,
      [req.params.subredditId],
    );
    if (!rows[0]) throw new HttpError(404, "No civilization generated yet for this subreddit.");
    res.json(rows[0]);
  }),
);

export const generateSchema = z.object({ seasonId: z.string().uuid() });

// POST /api/civilization/:subredditId/generate — generated once per subreddit per season, never repeated.
civilizationRouter.post(
  "/:subredditId/generate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { seasonId } = generateSchema.parse(req.body);

    const existing = await query(`SELECT id FROM civilizations WHERE subreddit_id = $1 AND season_id = $2`, [
      req.params.subredditId,
      seasonId,
    ]);
    if (existing.rows[0]) {
      throw new HttpError(409, "A civilization already exists for this subreddit and season.");
    }

    const subreddit = await query<{ name: string }>(`SELECT name FROM subreddits WHERE id = $1`, [
      req.params.subredditId,
    ]);
    if (!subreddit.rows[0]) throw new HttpError(404, "Subreddit not found.");

    const generated = await generateCivilization(subreddit.rows[0].name);

    const { rows } = await query(
      `INSERT INTO civilizations (subreddit_id, season_id, name, origin_story) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.subredditId, seasonId, generated.name, generated.originStory],
    );

    res.status(201).json(rows[0]);
  }),
);

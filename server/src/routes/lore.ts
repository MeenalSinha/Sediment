import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { query } from "../db/pool";
import { polishLore } from "../ai/client";
import { HttpError } from "../middleware/errorHandler";

export const loreRouter = Router();

// GET /api/lore/artifact/:artifactId
loreRouter.get(
  "/artifact/:artifactId",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT * FROM lore_entries WHERE artifact_id = $1 ORDER BY votes DESC, created_at DESC`,
      [req.params.artifactId],
    );
    res.json(rows);
  }),
);

export const submitSchema = z.object({ artifactId: z.string().uuid(), body: z.string().min(3).max(1000) });

// POST /api/lore — submit a new community lore entry. AI polishes phrasing without changing meaning.
loreRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { artifactId, body } = submitSchema.parse(req.body);
    const authorId = req.auth!.userId;

    let polished = body;
    let aiPolished = false;
    try {
      polished = await polishLore(body);
      aiPolished = true;
    } catch {
      // AI polishing is optional enrichment — fall back to the author's original text if unavailable.
    }

    const { rows } = await query(
      `INSERT INTO lore_entries (artifact_id, author_id, body, ai_polished) VALUES ($1, $2, $3, $4) RETURNING *`,
      [artifactId, authorId, polished, aiPolished],
    );

    res.status(201).json(rows[0]);
  }),
);

// POST /api/lore/:id/vote — upvote a lore entry; the top-voted entry becomes the artifact's official description.
loreRouter.post(
  "/:id/vote",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.auth!.userId;
    const loreId = req.params.id;

    const inserted = await query(
      `INSERT INTO lore_votes (lore_entry_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
      [loreId, userId],
    );
    if (inserted.rows.length === 0) {
      throw new HttpError(409, "You already voted for this lore entry.");
    }

    const { rows } = await query<{ artifact_id: string; votes: number }>(
      `UPDATE lore_entries SET votes = votes + 1 WHERE id = $1 RETURNING artifact_id, votes`,
      [loreId],
    );
    const entry = rows[0];
    if (!entry) throw new HttpError(404, "Lore entry not found.");

    // Promote the current top-voted entry to "official" for this artifact.
    const top = await query<{ id: string }>(
      `SELECT id FROM lore_entries WHERE artifact_id = $1 ORDER BY votes DESC, created_at ASC LIMIT 1`,
      [entry.artifact_id],
    );
    if (top.rows[0]) {
      await query(`UPDATE lore_entries SET is_official = (id = $2) WHERE artifact_id = $1`, [
        entry.artifact_id,
        top.rows[0].id,
      ]);
      await query(`UPDATE artifacts SET official_lore_id = $2 WHERE id = $1`, [entry.artifact_id, top.rows[0].id]);
    }

    res.json({ votes: entry.votes });
  }),
);

import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { query } from "../db/pool";
import { HttpError } from "../middleware/errorHandler";
import { broadcastRealtimeEvent } from "../sockets";

export const artifactsRouter = Router();

// GET /api/artifacts/:subredditId
artifactsRouter.get(
  "/:subredditId",
  asyncHandler(async (req, res) => {
    const { status } = req.query as { status?: string };
    const params: unknown[] = [req.params.subredditId];
    let sql = `SELECT * FROM artifacts WHERE subreddit_id = $1`;
    if (status) {
      params.push(status);
      sql += ` AND status = $2`;
    }
    sql += ` ORDER BY created_at DESC LIMIT 100`;

    const { rows } = await query(sql, params);
    res.json(rows);
  }),
);

// GET /api/artifacts/detail/:id
artifactsRouter.get(
  "/detail/:id",
  asyncHandler(async (req, res) => {
    const { rows } = await query(`SELECT * FROM artifacts WHERE id = $1`, [req.params.id]);
    if (!rows[0]) throw new HttpError(404, "Artifact not found.");
    res.json(rows[0]);
  }),
);

export const restoreSchema = z.object({ qualityDelta: z.number().min(-20).max(20) });

// POST /api/artifacts/:id/restore
artifactsRouter.post(
  "/:id/restore",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { qualityDelta } = restoreSchema.parse(req.body);
    const userId = req.auth!.userId;

    await query(`INSERT INTO restoration_sessions (artifact_id, user_id, quality_delta) VALUES ($1, $2, $3)`, [
      req.params.id,
      userId,
      qualityDelta,
    ]);

    const { rows } = await query<{ condition: string; status: string; subreddit_id: string }>(
      `UPDATE artifacts
       SET condition = LEAST(100, GREATEST(0, condition + $2)),
           status = CASE WHEN condition + $2 >= 100 THEN 'restored' ELSE 'in_restoration' END,
           updated_at = now()
       WHERE id = $1
       RETURNING condition, status, subreddit_id`,
      [req.params.id, qualityDelta],
    );

    const updated = rows[0];
    if (!updated) throw new HttpError(404, "Artifact not found.");

    if (updated.status === "restored") {
      await broadcastRealtimeEvent({
        type: "artifact_restored",
        subredditId: updated.subreddit_id,
        payload: { artifactId: req.params.id },
        timestamp: new Date().toISOString(),
      });
    }

    res.json(updated);
  }),
);

// POST /api/artifacts/:id/discover — marks an artifact as excavated and records the discovering user.
artifactsRouter.post(
  "/:id/discover",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.auth!.userId;

    await query(`INSERT INTO artifact_discoverers (artifact_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [
      req.params.id,
      userId,
    ]);

    const { rows } = await query<{ subreddit_id: string; rarity: string; name: string }>(
      `UPDATE artifacts
       SET status = 'excavated', discovered_at = COALESCE(discovered_at, now())
       WHERE id = $1
       RETURNING subreddit_id, rarity, name`,
      [req.params.id],
    );

    const artifact = rows[0];
    if (!artifact) throw new HttpError(404, "Artifact not found.");

    await broadcastRealtimeEvent({
      type: artifact.rarity === "legendary" ? "legendary_discovery" : "artifact_discovered",
      subredditId: artifact.subreddit_id,
      payload: { artifactId: req.params.id, name: artifact.name },
      timestamp: new Date().toISOString(),
    });

    res.status(204).send();
  }),
);

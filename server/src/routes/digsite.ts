import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { query } from "../db/pool";
import { cached } from "../db/redis";
import { broadcastRealtimeEvent } from "../sockets";
import { HttpError } from "../middleware/errorHandler";

export const digSiteRouter = Router();

// GET /api/digsite/:subredditId/today
digSiteRouter.get(
  "/:subredditId/today",
  asyncHandler(async (req, res) => {
    const { subredditId } = req.params;

    const layer = await cached(`digsite:today:${subredditId}`, 30, async () => {
      const { rows } = await query(`SELECT * FROM dig_layers WHERE subreddit_id = $1 ORDER BY index DESC LIMIT 1`, [
        subredditId,
      ]);
      return rows[0] ?? null;
    });

    if (!layer) throw new HttpError(404, "No active dig layer for this subreddit yet.");
    res.json(layer);
  }),
);

export const strokeSchema = z.object({
  layerId: z.string().uuid(),
  toolId: z.enum(["brush", "pickaxe", "fine_brush", "air_blower", "water_spray"]),
  clearedDelta: z.number().min(0).max(1),
});

// POST /api/digsite/stroke — records a single excavation stroke's contribution to community progress.
digSiteRouter.post(
  "/stroke",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { layerId, toolId, clearedDelta } = strokeSchema.parse(req.body);
    const userId = req.auth!.userId;

    await query(`INSERT INTO dig_contributions (layer_id, user_id, tool_id, cleared_delta) VALUES ($1, $2, $3, $4)`, [
      layerId,
      userId,
      toolId,
      clearedDelta,
    ]);

    const { rows } = await query<{ progress: string; subreddit_id: string }>(
      `UPDATE dig_layers
       SET progress = LEAST(100, progress + $2)
       WHERE id = $1
       RETURNING progress, subreddit_id`,
      [layerId, clearedDelta * 100],
    );

    const updated = rows[0];
    if (!updated) throw new HttpError(404, "Dig layer not found.");

    await broadcastRealtimeEvent({
      type: "layer_progress",
      subredditId: updated.subreddit_id,
      payload: { layerId, progress: Number(updated.progress) },
      timestamp: new Date().toISOString(),
    });

    res.json({ progress: Number(updated.progress) });
  }),
);

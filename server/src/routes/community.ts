import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";
import { query } from "../db/pool";
import { broadcastRealtimeEvent } from "../sockets";

export const communityRouter = Router();

// GET /api/community/:subredditId/feed
communityRouter.get(
  "/:subredditId/feed",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT f.*, u.reddit_username AS username, u.active_role AS role
       FROM feed_items f
       JOIN users u ON u.id = f.user_id
       WHERE f.subreddit_id = $1
       ORDER BY f.created_at DESC
       LIMIT 50`,
      [req.params.subredditId],
    );
    res.json(rows);
  }),
);

export const postSchema = z.object({ body: z.string().min(1).max(500), artifactId: z.string().uuid().optional() });

// POST /api/community/:subredditId/feed
communityRouter.post(
  "/:subredditId/feed",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { body, artifactId } = postSchema.parse(req.body);
    const { rows } = await query(
      `INSERT INTO feed_items (subreddit_id, user_id, body, artifact_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.params.subredditId, req.auth!.userId, body, artifactId ?? null],
    );

    await broadcastRealtimeEvent({
      type: "feed_item",
      subredditId: String(req.params.subredditId),
      payload: rows[0],
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(rows[0]);
  }),
);

// GET /api/community/:subredditId/events
communityRouter.get(
  "/:subredditId/events",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT * FROM community_events WHERE subreddit_id = $1 AND ends_at > now() ORDER BY starts_at ASC`,
      [req.params.subredditId],
    );
    res.json(rows);
  }),
);

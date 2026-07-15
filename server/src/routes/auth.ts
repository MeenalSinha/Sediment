import { Router } from "express";
import crypto from "node:crypto";
import { asyncHandler } from "../utils/asyncHandler";
import { buildRedditAuthUrl, exchangeCodeForToken, fetchRedditIdentity } from "../reddit/oauth";
import { upsertUserFromReddit, findUserById } from "../db/usersRepo";
import { signSessionToken } from "../utils/jwt";
import { SESSION_COOKIE_NAME } from "../middleware/auth";
import { mapUserRow } from "../utils/mappers";
import { env } from "../config/env";
import { redis } from "../db/redis";

export const authRouter = Router();

// GET /api/auth/reddit/login — redirects the browser to Reddit's consent screen.
authRouter.get(
  "/reddit/login",
  asyncHandler(async (_req, res) => {
    const state = crypto.randomBytes(16).toString("hex");
    await redis.set(`oauth_state:${state}`, "1", "EX", 600);
    res.redirect(buildRedditAuthUrl(state));
  }),
);

// GET /api/auth/reddit/callback — Reddit redirects here with ?code=&state=
authRouter.get(
  "/reddit/callback",
  asyncHandler(async (req, res) => {
    const { code, state, error } = req.query as { code?: string; state?: string; error?: string };

    if (error || !code || !state) {
      return res.redirect(`${env.webOrigin}?auth_error=1`);
    }

    const stateKey = `oauth_state:${state}`;
    const stateValid = await redis.get(stateKey);
    if (!stateValid) {
      return res.redirect(`${env.webOrigin}?auth_error=invalid_state`);
    }
    await redis.del(stateKey);

    const tokenResponse = await exchangeCodeForToken(code);
    const identity = await fetchRedditIdentity(tokenResponse.access_token);

    const avatarUrl = (identity.icon_img || identity.subreddit?.icon_img || "").split("?")[0] || null;

    const userRow = await upsertUserFromReddit({
      redditId: identity.id,
      redditUsername: identity.name,
      avatarUrl,
    });

    const sessionToken = signSessionToken({ userId: userRow.id, redditUsername: userRow.reddit_username });

    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(env.webOrigin);
  }),
);

// POST /api/auth/logout
authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME);
  res.status(204).send();
});

// GET /api/auth/me — returns the current session's user, or 401.
authRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    if (!req.auth) return res.status(401).json({ message: "Not signed in" });

    const row = await findUserById(req.auth.userId);
    if (!row) return res.status(401).json({ message: "Not signed in" });

    res.json(mapUserRow(row));
  }),
);

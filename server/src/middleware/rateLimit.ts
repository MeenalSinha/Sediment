import rateLimit from "express-rate-limit";

/** Baseline limiter applied to every request: generous, just stops runaway scripts/bots. */
export const globalRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});

/**
 * Stricter limiter for the Reddit OAuth flow — login/callback are unauthenticated
 * and hit external Reddit endpoints, so they're the cheapest way to abuse the API
 * if left uncapped.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please wait a minute and try again." },
});

/**
 * Stricter limiter for state-changing, community-visible actions (lore, feed posts,
 * dig strokes) to make spam/flooding meaningfully harder without affecting normal play.
 */
export const writeActionRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "You're doing that too fast — please slow down." },
});

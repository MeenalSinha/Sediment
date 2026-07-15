import Redis from "ioredis";
import { env } from "../config/env";

/**
 * `lazyConnect: true` means importing this module never opens a socket by itself —
 * connection happens on the first real command. This matters for two reasons: (1) test
 * files that import a route module just to reach an exported zod schema shouldn't also
 * silently try to open a TCP connection to Redis, and (2) `retryStrategy` is capped so a
 * genuinely-down Redis fails fast with a clear log line instead of retrying forever with
 * exponential backoff and flooding stderr.
 */
const REDIS_OPTIONS = {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy: (attempt: number) => (attempt > 3 ? null : Math.min(attempt * 200, 1000)),
};

export const redis = new Redis(env.redisUrl, REDIS_OPTIONS);

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

/** Simple helper for caching a value with a TTL, falling back to a compute function on miss. */
export async function cached<T>(key: string, ttlSeconds: number, compute: () => Promise<T>): Promise<T> {
  const existing = await redis.get(key);
  if (existing) return JSON.parse(existing) as T;

  const value = await compute();
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  return value;
}

/** Dedicated publisher used to broadcast realtime events to every server instance's socket.io layer. */
export const redisPublisher = redis.duplicate();
export const redisSubscriber = redis.duplicate();

for (const client of [redisPublisher, redisSubscriber]) {
  client.on("error", (err) => {
    console.error("Redis connection error:", err.message);
  });
}

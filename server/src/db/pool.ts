import { Pool } from "pg";
import { env } from "../config/env";

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error", err);
});

export async function query<T = any>(text: string, params?: unknown[]): Promise<{ rows: T[] }> {
  const start = Date.now();
  const result = await pool.query(text, params as any[]);
  const durationMs = Date.now() - start;
  if (env.nodeEnv === "development" && durationMs > 200) {
    console.warn(`[db] slow query (${durationMs}ms): ${text}`);
  }
  return { rows: result.rows as T[] };
}

# API Reference

Base URL: `http://localhost:4000/api` (dev) — all endpoints return JSON.
Authenticated endpoints require the `sediment_session` cookie set by the Reddit OAuth
flow (see below); it's an httpOnly cookie, sent automatically by the browser when
`credentials: "include"` is used (already configured in `lib/api.ts`).

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/auth/reddit/login` | — | Redirects to Reddit's OAuth consent screen (identity scope only). |
| GET | `/auth/reddit/callback` | — | Reddit redirects here; sets the session cookie, redirects to `WEB_ORIGIN`. |
| POST | `/auth/logout` | — | Clears the session cookie. |
| GET | `/auth/me` | session | Returns the current `SedimentUser`, or 401. |

## Dig Site

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/digsite/:subredditId/today` | — | Returns the current (highest-index) `DigLayer` for a subreddit. Cached 30s in Redis. |
| POST | `/digsite/stroke` | session | Body: `{ layerId, toolId, clearedDelta }`. Records a contribution, increments layer progress, broadcasts `layer_progress`. |

## Artifacts

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/artifacts/:subredditId?status=` | — | List artifacts for a subreddit, optionally filtered by status. |
| GET | `/artifacts/detail/:id` | — | Single artifact detail. |
| POST | `/artifacts/:id/discover` | session | Marks excavated, records discoverer, broadcasts `artifact_discovered` or `legendary_discovery`. |
| POST | `/artifacts/:id/restore` | session | Body: `{ qualityDelta }`. Applies a restoration session; broadcasts `artifact_restored` at 100%. |

## Museum

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/museum/:subredditId/collection` | — | Per-category discovered/total tallies for the collection strip. |
| GET | `/museum/:subredditId/timeline` | — | Civilization timeline events, chronological. |

## Lore

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/lore/artifact/:artifactId` | — | All lore entries for an artifact, top-voted first. |
| POST | `/lore` | session | Body: `{ artifactId, body }`. AI-polishes phrasing (best-effort), stores entry. |
| POST | `/lore/:id/vote` | session | One vote per user per entry; re-computes which entry is `is_official`. |

## Community

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/community/:subredditId/feed` | — | Last 50 live feed items. |
| POST | `/community/:subredditId/feed` | session | Body: `{ body, artifactId? }`. Broadcasts `feed_item`. |
| GET | `/community/:subredditId/events` | — | Active community events (sandstorms, discovery hunts, etc). |

## Civilization

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/civilization/:subredditId` | — | The latest generated civilization for a subreddit. |
| POST | `/civilization/:subredditId/generate` | session | Body: `{ seasonId }`. Generates once per subreddit+season (409 if it already exists). |

## AI

All AI endpoints require `OPENAI_API_KEY` to be configured; they enrich content, they
never replace what a player wrote.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/ai/polish-lore` | session | Body: `{ text }` → `{ polished }`. |
| POST | `/ai/translate-inscription` | session | Body: `{ description }` → `{ translation }` (clearly fictional). |
| POST | `/ai/generate-civilization` | session | Body: `{ subredditName }` → `{ name, originStory }`. |
| POST | `/ai/summarize-artifact` | session | Body: `{ name, category, material, period }` → `{ summary }`. |

## Realtime (Socket.IO)

Connect to the server root with `withCredentials: true`. Client emits:

- `join_subreddit` — `{ subredditId }`, joins that subreddit's broadcast room.

Server emits `realtime_event` with payload `{ type, subredditId, payload, timestamp }`
where `type` is one of: `cell_updated`, `artifact_discovered`, `artifact_restored`,
`legendary_discovery`, `layer_progress`, `feed_item`, `community_event_update`.

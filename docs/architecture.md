# Architecture

Sediment is an npm-workspaces monorepo with four independently-buildable layers.
Every arrow below is a real, running connection — not a conceptual one.

```
apps/web  <--HTTP/JSON-->  server  <--SQL-->  PostgreSQL
   |         <--WebSocket-->  |    <--cache/pubsub-->  Redis
   |                          |
   | mounts                   |--> Reddit OAuth (identity only)
   v                          |--> OpenAI (lore polish, translation, civ-gen)
packages/game (Phaser+Matter) |--> Supabase Storage / Cloudinary
   |
packages/ui, packages/shared  (consumed by both apps/web and server)
```

## Layers

### `packages/shared`
Single source of truth for every domain type (`Artifact`, `DigLayer`, `SedimentUser`,
realtime event payloads, etc.) plus static constants (tool behavior table, role labels,
achievement list). Both `server` and `apps/web` import from here so the API and the
frontend can never drift out of sync on shape.

### `packages/game`
A framework-agnostic Phaser 3 + Matter.js module. `createDigSiteGame()` boots a game
into any DOM element and returns a small handle (`setTool`, `destroy`). Internally:

- **`DigSiteScene`** owns a `RenderTexture` sediment overlay drawn over the artifact
  image. Pointer strokes call `overlay.erase()` with a soft circular stencil, which is
  what visually reveals the artifact underneath.
- **`DustGrid`** tracks *logical* clearance on a coarse grid (independent of the erase
  texture) so "percent cleared" is cheap to compute and safe to sync to the server —
  no pixel read-back required.
- **`DebrisField`** scatters small Matter.js circle bodies (pebbles/rock fragments)
  across the canvas; strokes apply a radial force to nearby bodies so digging visibly
  disturbs debris, not just erases a texture.
- **`ToolController`** maps each tool id to brush radius, erase strength, particle
  count, debris force, and damage risk — this is the single place tool balance lives.

React never touches Phaser internals directly; it only calls the returned handle and
listens to the `onProgress` / `onDamage` / `onArtifactRevealed` callbacks passed into
`createDigSiteGame`.

### `packages/ui`
Small shared component set (`Panel`, `ProgressBar`, `Button`, `StatPill`) built with
Tailwind utility classes so both the web app and (in future) any secondary surface
share one visual language.

### `apps/web`
React 19 + Vite + TypeScript. `useDigSiteGame` (a hook) is the bridge between React
state (Zustand store in `lib/store.ts`) and the Phaser game instance. `lib/api.ts` is
a typed fetch wrapper for the REST API; `lib/socket.ts` wraps `socket.io-client` for
realtime events (new discoveries, layer progress, live feed).

### `server`
Express + TypeScript, organized by concern:

- `routes/*` — thin HTTP handlers, validated with `zod`.
- `db/pool.ts` — a `pg` connection pool; `db/redis.ts` — an `ioredis` client used both
  as a cache (`cached()` helper) and as the pub/sub backbone for `sockets/index.ts`,
  so realtime events fan out correctly across multiple server instances.
- `reddit/oauth.ts` — the full Reddit OAuth2 "identity"-scope flow (login redirect,
  code exchange, identity fetch). No write scopes are requested, per the design brief.
- `ai/client.ts` — all OpenAI calls. AI is used only to *enrich* (polish lore grammar,
  invent a fictional inscription translation, seed a civilization's origin story) and
  is designed to degrade gracefully: if `OPENAI_API_KEY` is unset, lore submission
  still works, it's just not polished.
- `services/storage.ts` — uploads to Supabase Storage or Cloudinary, switchable via
  `STORAGE_PROVIDER`.
- `sockets/index.ts` — Socket.IO server; subreddit-scoped rooms; Redis pub/sub means
  any server instance can broadcast an event and every instance's connected clients
  receive it.

## Realtime event flow (example: a legendary discovery)

1. Client calls `POST /api/artifacts/:id/discover`.
2. Route updates Postgres, then calls `broadcastRealtimeEvent(...)`.
3. That publishes a JSON payload on the `sediment:realtime` Redis channel.
4. Every server process's `redisSubscriber` receives it and re-emits to
   `io.to('subreddit:<id>')`.
5. Every browser in that subreddit's room receives a `realtime_event` socket message
   and updates its UI (toast, live feed entry, museum badge, etc).

## Data flow for the core dig loop

1. Player drags a tool across the canvas → `DigSiteScene.applyStroke`.
2. Locally: overlay erases, particles spawn, debris is nudged, `DustGrid` updates.
3. Throttled from the React layer, `onProgress`/stroke deltas are POSTed to
   `/api/digsite/stroke`, which increments the shared `dig_layers.progress` column
   and republishes a `layer_progress` realtime event so every other digger's client
   sees the same layer advance live.
4. When a layer's cumulative community progress crosses a threshold, an `artifacts`
   row transitions `buried → excavated`, which is what unlocks restoration, lore, and
   museum display for that piece.

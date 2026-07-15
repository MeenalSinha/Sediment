-- ============================================================
-- Sediment — Database Schema
-- PostgreSQL 15+
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------- Users ----------
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reddit_id         TEXT UNIQUE NOT NULL,
  reddit_username   TEXT UNIQUE NOT NULL,
  avatar_url        TEXT,
  flair             TEXT,
  level             INTEGER NOT NULL DEFAULT 1,
  xp                INTEGER NOT NULL DEFAULT 0,
  xp_to_next_level  INTEGER NOT NULL DEFAULT 500,
  dig_energy        INTEGER NOT NULL DEFAULT 100,
  max_dig_energy    INTEGER NOT NULL DEFAULT 100,
  next_energy_at    TIMESTAMPTZ,
  coins             BIGINT NOT NULL DEFAULT 0,
  gems              BIGINT NOT NULL DEFAULT 0,
  active_role       TEXT NOT NULL DEFAULT 'archaeologist',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_roles (
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id           TEXT NOT NULL,
  level             INTEGER NOT NULL DEFAULT 1,
  xp                INTEGER NOT NULL DEFAULT 0,
  unlocked_abilities TEXT[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE user_achievements (
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id    TEXT NOT NULL,
  unlocked_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, achievement_id)
);

-- ---------- Subreddits & Civilizations ----------
CREATE TABLE subreddits (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT UNIQUE NOT NULL, -- e.g. "r/history"
  total_diggers     INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE seasons (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL,
  civilization_theme TEXT NOT NULL,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  pass_tier_max     INTEGER NOT NULL DEFAULT 25
);

CREATE TABLE civilizations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subreddit_id      UUID NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
  season_id         UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  origin_story      TEXT NOT NULL,
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (subreddit_id, season_id)
);

CREATE TABLE civilization_timeline_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  civilization_id   UUID NOT NULL REFERENCES civilizations(id) ON DELETE CASCADE,
  era               TEXT NOT NULL CHECK (era IN ('founding','war','golden_age','collapse','rediscovery')),
  year              INTEGER NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  triggered_by_artifact_id UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Dig layers & cells ----------
CREATE TABLE dig_layers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subreddit_id      UUID NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
  index             INTEGER NOT NULL,
  name              TEXT NOT NULL,
  unlocked_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress          NUMERIC(5,2) NOT NULL DEFAULT 0,
  chamber_type      TEXT NOT NULL,
  is_rare_chamber   BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (subreddit_id, index)
);

CREATE TABLE dig_cells (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  layer_id          UUID NOT NULL REFERENCES dig_layers(id) ON DELETE CASCADE,
  grid_x            INTEGER NOT NULL,
  grid_y            INTEGER NOT NULL,
  material          TEXT NOT NULL DEFAULT 'dust',
  hitpoints         INTEGER NOT NULL DEFAULT 100,
  artifact_id       UUID,
  UNIQUE (layer_id, grid_x, grid_y)
);

CREATE TABLE dig_contributions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  layer_id          UUID NOT NULL REFERENCES dig_layers(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_id           TEXT NOT NULL,
  cleared_delta     NUMERIC(6,4) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_dig_contributions_layer ON dig_contributions(layer_id);

-- ---------- Artifacts ----------
CREATE TABLE artifacts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subreddit_id      UUID NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
  layer_id          UUID REFERENCES dig_layers(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  category           TEXT NOT NULL,
  rarity            TEXT NOT NULL DEFAULT 'common',
  material          TEXT,
  period            TEXT,
  condition         NUMERIC(5,2) NOT NULL DEFAULT 100,
  status            TEXT NOT NULL DEFAULT 'buried',
  position_x        NUMERIC,
  position_y        NUMERIC,
  image_url         TEXT,
  model_url         TEXT,
  ai_summary        TEXT,
  official_lore_id  UUID,
  scientific_notes  TEXT,
  discovered_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_artifacts_subreddit ON artifacts(subreddit_id);
CREATE INDEX idx_artifacts_status ON artifacts(status);

CREATE TABLE artifact_discoverers (
  artifact_id       UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contributed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (artifact_id, user_id)
);

CREATE TABLE restoration_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artifact_id       UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quality_delta     NUMERIC(5,2) NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Lore ----------
CREATE TABLE lore_entries (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artifact_id       UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  author_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body              TEXT NOT NULL,
  votes             INTEGER NOT NULL DEFAULT 0,
  is_official       BOOLEAN NOT NULL DEFAULT false,
  ai_polished       BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_lore_artifact ON lore_entries(artifact_id);

CREATE TABLE lore_votes (
  lore_entry_id     UUID NOT NULL REFERENCES lore_entries(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lore_entry_id, user_id)
);

ALTER TABLE artifacts
  ADD CONSTRAINT fk_artifacts_official_lore
  FOREIGN KEY (official_lore_id) REFERENCES lore_entries(id) ON DELETE SET NULL;

-- ---------- Season pass ----------
CREATE TABLE season_pass_progress (
  season_id         UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  xp                INTEGER NOT NULL DEFAULT 0,
  tier              INTEGER NOT NULL DEFAULT 0,
  claimed_tiers     INTEGER[] NOT NULL DEFAULT '{}',
  PRIMARY KEY (season_id, user_id)
);

-- ---------- Community events ----------
CREATE TABLE community_events (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subreddit_id      UUID NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
  type              TEXT NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ NOT NULL,
  progress          NUMERIC(6,2),
  goal              NUMERIC(6,2)
);

-- ---------- Live feed ----------
CREATE TABLE feed_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subreddit_id      UUID NOT NULL REFERENCES subreddits(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body              TEXT NOT NULL,
  artifact_id       UUID REFERENCES artifacts(id) ON DELETE SET NULL,
  upvotes           INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_feed_subreddit_created ON feed_items(subreddit_id, created_at DESC);

-- ---------- Sessions ----------
CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash TEXT NOT NULL,
  expires_at        TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

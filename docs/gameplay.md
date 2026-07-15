# Gameplay

## Core loop

Daily Layer Opens → Community Excavates → Dust Clears → Artifacts Appear →
Players Restore Them → Community Writes Lore → Museum Expands →
Civilization History Updates → Next Layer Unlocks

## Tools

| Tool | Feel | Risk | Effect |
|---|---|---|---|
| Brush | Safe, slow | Very low | General clearing |
| Pickaxe | Fast | High | Breaks through rock, risks cracking artifacts |
| Fine Brush | Slow, precise | Very low | Best for fragile fossils |
| Air Blower | Fast | None | Clears loose dust only |
| Water Spray | Medium | Low | Reveals faded inscriptions |

Balance numbers for each tool (brush radius, erase strength, damage risk, particle
count, debris force) live in one place: `packages/game/src/tools/ToolController.ts`.

## Roles

Archaeologist, Historian, Conservator, Linguist, Curator, Cartographer, Researcher,
Photographer, Storyteller. Each has its own level/XP track (`user_roles` table) and
unlocks abilities (stored as a text array per role — e.g. a Linguist's higher levels
could unlock more accurate AI inscription translations).

## Legendary discoveries

When a rare chamber (`dig_layers.is_rare_chamber`) or a `legendary` rarity artifact is
uncovered, the discovery route emits a `legendary_discovery` realtime event distinct
from ordinary `artifact_discovered` events, so the frontend can trigger a distinct
cinematic sequence (confetti/particles/camera shake) rather than the standard toast.

## Community lore & the "official" description

Every artifact accepts unlimited community lore submissions. Each user may upvote a
given entry once (`lore_votes`, unique on `(lore_entry_id, user_id)`). Whichever entry
has the most votes for an artifact automatically becomes `is_official = true` and is
linked from `artifacts.official_lore_id` — this recomputation happens transactionally
inside `POST /api/lore/:id/vote`. AI polishing (`ai/client.ts::polishLore`) is applied
at submission time for grammar/clarity only; the system prompt explicitly forbids
inventing new facts.

## Seasons

A `Season` defines a time window and a `civilizationTheme`. `civilizations` is unique
on `(subreddit_id, season_id)` — a subreddit gets exactly one generated civilization
per season, "generated once, never repeated," per the design brief. `season_pass_progress`
tracks per-user tier/xp/claimed-tiers for that season.

## Community events

`community_events` covers both narrative random events (sandstorm, earthquake, flood,
hidden tunnel, treasure chamber, trap mechanism, ancient puzzle, rare fossil, meteor
impact) and structured community goals (legendary discovery hunts, double-restoration
weekends), distinguished by `type` and by whether `progress`/`goal` are populated.

## Achievements

Defined statically in `packages/shared/src/constants/roles.ts::ACHIEVEMENTS` and
tracked per-user in `user_achievements`. Unlock conditions (first discovery, 100
artifacts, perfect restoration, etc.) are intentionally left as a `services/`-layer
extension point — wire them up alongside whatever action should trigger the check
(e.g. check "perfect_restoration" inside the `/artifacts/:id/restore` handler once
`condition` hits 100).

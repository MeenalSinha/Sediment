# Assets

Placeholder structure for production art/audio. Ship real files here before a public
launch — the prototype currently generates placeholder art procedurally
(`packages/game/src/scenes/DigSiteScene.ts::generateProceduralDirtTexture`) and uses a
data-URI SVG placeholder for artifact imagery (`apps/web/src/pages/DigSite.tsx`) so it
runs with zero external assets out of the box.

- `sprites/` — artifact imagery, tool icons, UI chrome, particle textures.
- `audio/` — ambient wind/birds, brush/pickaxe/water sound effects, museum ambience,
  the soft orchestral soundtrack loops referenced in `docs/gameplay.md`.
- `icons/` — favicon, PWA icons, role/achievement badges.
- `fonts/` — self-hosted copies of Cinzel/Playfair Display/Inter if you want to drop
  the Google Fonts CDN dependency in `apps/web/index.html`.

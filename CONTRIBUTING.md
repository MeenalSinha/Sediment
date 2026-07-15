# Contributing to Sediment

## Getting set up

```bash
cp .env.example .env
npm install --workspaces --include-workspace-root
npm run dev
```

See `docs/deployment.md` for the full local/Docker setup and `docs/architecture.md`
for how the pieces fit together before making changes.

## Before opening a PR

```bash
npm run build          # all 5 workspaces, in dependency order
npm run test           # 55 tests across game/server/web
npm run lint            # must be 0 errors, 0 warnings
npm run format:check    # must report no issues
```

CI (`.github/workflows/ci.yml`) runs all four against every PR — a PR that doesn't
pass all four locally won't pass CI either.

## Code style

- Prettier (`.prettierrc.json`) is the source of truth for formatting — run
  `npm run format` rather than hand-formatting.
- ESLint config intentionally sets `@typescript-eslint/no-explicit-any: off` and
  `no-unused-vars: off` project-wide — this is a deliberate choice for a fast-moving
  prototype, not an oversight. Don't re-enable them in a partial PR.
- Keep domain types in `packages/shared` — if you're duplicating a shape between
  `apps/web` and `server`, it belongs there instead.
- Tool/game balance constants live in one place:
  `packages/game/src/tools/ToolController.ts`. Don't hardcode brush radii or damage
  risk elsewhere.

## Testing expectations

- Pure logic (game balance, validation schemas, store actions) → unit tests, no DOM.
- Anything rendering to the DOM → React Testing Library (`apps/web/tests`), with
  `render`/`screen`/`fireEvent`, not shallow snapshots.
- New API routes → export their zod schema and add schema tests
  (see `server/tests/validation.test.ts` for the pattern), even before the route's
  DB-dependent logic is fully wired.

## Known, intentional gaps

`docs/audit-report.md` lists exactly what's implemented, what's partial, and what's
missing, with reasoning. Please check it before assuming something is either "done"
or "not started" — several things (Museum search, a daily-rollover scheduler, live
frontend↔backend wiring) are deliberately scoped as follow-up work, not bugs.

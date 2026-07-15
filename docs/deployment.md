# Deployment

## Local development

```bash
cp .env.example .env        # fill in Reddit/OpenAI/Supabase credentials
npm install --workspaces --include-workspace-root
npm run docker:up           # postgres + redis (only), if you don't want them local
npm run db:migrate -- --seed
npm run dev                 # runs web (5173) + server (4000) together
```

## Docker Compose (full stack)

```bash
cp .env.example .env
docker compose up --build
```

This starts Postgres (with schema+seed auto-applied via
`docker-entrypoint-initdb.d`), Redis, the API on `:4000`, and the web app served by
nginx on `:5173`.

## Production deployment

The intended split:

- **Web app (`apps/web`)** → **Vercel**. Build command:
  `npm run build -w packages/shared && npm run build -w packages/ui && npm run build -w packages/game && npm run build -w apps/web`,
  output directory `apps/web/dist`. Set `VITE_API_BASE_URL`, `VITE_SOCKET_URL`,
  `VITE_REDDIT_LOGIN_URL` as Vercel environment variables pointing at your deployed API.
- **API (`server`)** → **Railway** (or any container host). Railway can build directly
  from `server/Dockerfile`, or run `npm run build -w server` and start
  `node server/dist/index.js`. Provision a Railway Postgres and Redis plugin and set
  `DATABASE_URL` / `REDIS_URL` accordingly, plus all the Reddit/OpenAI/Storage secrets
  from `.env.example`.
- **GitHub Actions** (`.github/workflows/ci.yml`, `deploy.yml`) run lint/build/test on
  every PR, and on `main` build the web app and push it to Vercel while deploying the
  API to Railway. Required repo secrets: `RAILWAY_TOKEN`, `VERCEL_TOKEN`,
  `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, plus the three `VITE_*` values.

## Reddit app registration

1. Go to <https://www.reddit.com/prefs/apps> → "create another app".
2. Choose type **web app**.
3. Redirect URI must exactly match `REDDIT_REDIRECT_URI` in your `.env`
   (e.g. `https://api.yourdomain.com/api/auth/reddit/callback`).
4. Copy the client id/secret into `REDDIT_CLIENT_ID` / `REDDIT_CLIENT_SECRET`.

## Database migrations

`database/run-migrations.js` is a minimal, dependency-light runner — it applies
`schema.sql` (always) and `seed.sql` (only with `--seed`, for local/dev data). For a
team environment, consider swapping this for a proper migration tool (e.g.
node-pg-migrate or Prisma Migrate) once the schema starts changing incrementally
rather than being defined once up front.

FROM node:20-alpine AS base
WORKDIR /repo

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/package.json
COPY server/package.json server/package.json

RUN npm install --workspaces --if-present --include-workspace-root

COPY packages/shared packages/shared
COPY server server

RUN npm run build -w packages/shared
RUN npm run build -w server

FROM node:20-alpine AS runtime
WORKDIR /repo
ENV NODE_ENV=production

COPY --from=base /repo/node_modules ./node_modules
COPY --from=base /repo/packages/shared/dist ./packages/shared/dist
COPY --from=base /repo/packages/shared/package.json ./packages/shared/package.json
COPY --from=base /repo/server/dist ./server/dist
COPY --from=base /repo/server/package.json ./server/package.json

EXPOSE 4000
CMD ["node", "server/dist/index.js"]

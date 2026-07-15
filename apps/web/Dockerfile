FROM node:20-alpine AS base
WORKDIR /repo

COPY package.json package-lock.json* ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json
COPY packages/game/package.json packages/game/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm install --workspaces --if-present --include-workspace-root

COPY packages/shared packages/shared
COPY packages/ui packages/ui
COPY packages/game packages/game
COPY apps/web apps/web

ARG VITE_API_BASE_URL
ARG VITE_SOCKET_URL
ARG VITE_REDDIT_LOGIN_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_REDDIT_LOGIN_URL=$VITE_REDDIT_LOGIN_URL

RUN npm run build -w packages/shared
RUN npm run build -w packages/ui
RUN npm run build -w packages/game
RUN npm run build -w apps/web

FROM nginx:alpine AS runtime
COPY --from=base /repo/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

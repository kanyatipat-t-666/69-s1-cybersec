# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337 \
    APP_KEYS=build-placeholder-1,build-placeholder-2 \
    ADMIN_JWT_SECRET=build-placeholder \
    API_TOKEN_SALT=build-placeholder \
    TRANSFER_TOKEN_SALT=build-placeholder \
    JWT_SECRET=build-placeholder \
    ENCRYPTION_KEY=build-placeholder
COPY . .
RUN npm run build \
    && npm prune --omit=dev \
    && rm -rf .cache .tmp

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=1337
COPY --from=build --chown=node:node /app ./
RUN mkdir -p /app/.tmp /app/public/uploads \
    && chown node:node /app /app/.tmp /app/public/uploads
USER node
EXPOSE 1337
CMD ["npm", "run", "start"]

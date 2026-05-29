# syntax=docker/dockerfile:1.7
# Build context expected: repo root (wibotodo/)
# Multi-stage build for Angular SPA served by nginx.

# ─── Builder ───────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

WORKDIR /repo

# Install workspace deps (lockfile + workspace + frontend manifest)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/frontend/package.json apps/frontend/
RUN pnpm install --frozen-lockfile --filter=frontend...

# Copy source and build
COPY apps/frontend apps/frontend
WORKDIR /repo/apps/frontend

# The production API URL lives in src/environments/environment.prod.ts and is
# swapped in by angular.json's fileReplacements during the production build.
RUN pnpm exec ng build --configuration production

# ─── Runtime ───────────────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# SPA-aware nginx config (history-mode routing fallback)
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Angular build output
COPY --from=builder /repo/apps/frontend/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

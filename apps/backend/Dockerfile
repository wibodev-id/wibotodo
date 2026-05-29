# syntax=docker/dockerfile:1.7
# Build context expected: repo root (wibotodo/)
# Multi-stage build for NestJS backend with Prisma.

# ─── Builder ───────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.28.1 --activate

WORKDIR /repo

# Install workspace deps (lockfile + workspace + backend manifest)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/backend/package.json apps/backend/
RUN pnpm install --frozen-lockfile --filter=backend...

# Copy backend source + generate prisma client + compile
COPY apps/backend apps/backend
WORKDIR /repo/apps/backend
RUN pnpm exec prisma generate
RUN pnpm build

# Compile the Prisma seed (TS → CJS) so the runtime needs no ts-node/typescript.
# Emits to dist/prisma/seed.js (rootDir "." preserves the prisma/ folder).
RUN pnpm exec tsc prisma/seed.ts \
      --outDir dist --rootDir . \
      --module commonjs --target ES2021 \
      --esModuleInterop --skipLibCheck --moduleResolution node

# Produce a self-contained deployment under /app (includes prisma CLI — it is a
# runtime dependency for `prisma migrate deploy`).
RUN pnpm deploy --filter=backend --legacy --prod /app

# ─── Runtime ───────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runtime
RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy production node_modules + manifest from pnpm deploy
COPY --from=builder /app ./

# Copy compiled output + prisma schema/migrations (needed for migrate deploy).
# The generated Prisma client + query engine already arrived via `pnpm deploy`
# above (bundled inside /app/node_modules), so no extra .prisma copy is needed.
COPY --from=builder /repo/apps/backend/dist ./dist
COPY --from=builder /repo/apps/backend/prisma ./prisma

# Persist uploads under /app/uploads — mount a volume here in production
RUN mkdir -p /app/uploads

EXPOSE 3000

# On boot: run migrations, optionally seed (controlled by SEED_ON_BOOT), then start.
# Uses the bundled local prisma CLI (no network download) and the compiled seed.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && if [ \"$SEED_ON_BOOT\" = \"true\" ]; then node dist/prisma/seed.js || true; fi && node dist/main.js"]

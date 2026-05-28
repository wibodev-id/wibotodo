# ttodo

Todo list app with date filtering and image attachments. Built in ~2 days as a
NestJS + Angular ramp-up exercise for a portfolio piece.

## Stack

- **Backend:** NestJS 11, TypeScript, Prisma 6, PostgreSQL 16, JWT auth, Multer
- **Frontend:** Angular 21 (standalone components + signals), Tailwind v4, RxJS
- **Dev infra:** pnpm workspaces, Docker (Postgres), Swagger
- **Built with:** Claude Code CLI

## Features

- Email + password auth with JWT
- Todos with title, description, optional due date, optional image attachment
- Filter views: All · Today · This week · Overdue · Completed
- Toggle completion with timestamp
- Image upload (jpeg / png / webp / gif, max 5 MB)
- Per-user data isolation enforced server-side
- Swagger API docs at `/api`

## Project structure

```
ttodo/
├── apps/
│   ├── backend/         # NestJS API
│   │   ├── src/
│   │   │   ├── auth/        # JWT register/login + passport strategy
│   │   │   ├── todos/       # CRUD + filter logic
│   │   │   ├── uploads/     # Multer disk storage + serve
│   │   │   └── prisma/      # Global Prisma module
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   └── frontend/        # Angular SPA
│       └── src/app/
│           ├── core/        # services, interceptor, guards, models
│           └── features/    # auth + todos pages
├── scripts/             # db-up.sh / db-down.sh (docker)
└── package.json         # pnpm workspace root
```

## Local setup

Requirements: Node 20+, pnpm 10+, Docker.

```bash
# 1. Install dependencies
pnpm install

# 2. Start Postgres container
pnpm db:up

# 3. Run database migrations (first time only)
cd apps/backend
cp .env.example .env
pnpm exec prisma migrate dev
cd ../..

# 4. Start backend + frontend together
pnpm dev
```

Backend: http://localhost:3000  
Swagger: http://localhost:3000/api  
Frontend: http://localhost:4200

To stop the Postgres container later:

```bash
pnpm db:down
```

## API surface

| Method | Endpoint              | Auth     | Notes                                  |
| ------ | --------------------- | -------- | -------------------------------------- |
| POST   | `/auth/register`      | public   | `{ email, password, name? }`           |
| POST   | `/auth/login`         | public   | `{ email, password }` → `{ user, token }` |
| GET    | `/auth/me`            | bearer   | Returns the authenticated user         |
| GET    | `/todos?filter=today` | bearer   | `filter`: all/today/week/overdue/completed |
| POST   | `/todos`              | bearer   | Create todo                            |
| GET    | `/todos/:id`          | bearer   | Get one (owner only)                   |
| PATCH  | `/todos/:id`          | bearer   | Partial update                         |
| DELETE | `/todos/:id`          | bearer   | Delete (owner only)                    |
| POST   | `/uploads`            | bearer   | multipart `file` field; returns `path` |
| GET    | `/uploads/:filename`  | public   | Serve uploaded image                   |

## Deployment notes

- **Production target:** Backend on Coolify (Hetzner), frontend on Vercel.
- **Image storage:** Currently disk-based via Multer. Swap to S3-compatible
  storage (Hetzner Storage Box, Cloudflare R2) before scaling — see
  `apps/backend/src/uploads/uploads.controller.ts`.
- **Secrets:** Replace `JWT_SECRET` in production with a long random value
  (32+ bytes from `openssl rand -hex 32`).
- **Database:** Provision a managed Postgres in Coolify or external provider;
  point `DATABASE_URL` at it and re-run `prisma migrate deploy`.

## Why this project exists

I'm primarily a Laravel + Vue/Nuxt developer. This codebase was built to ramp
on the **TypeScript + NestJS + Angular** stack quickly — same architectural
patterns I use daily in Laravel (DI, modules, decorators, providers) applied to
a different ecosystem.

What I leaned on for speed:

- **AI tooling** (Claude Code CLI) for boilerplate and pattern lookup
- **Architectural transfer** — Prisma → Eloquent, NestJS modules → Laravel
  service providers, Angular standalone components → Vue 3 SFCs
- **Scope discipline** — single-user mode, no tags/sharing/reminders, ship the
  core loop first

## Lessons learned during the build

- Prisma 7 (released 2026) moves datasource URL into `prisma.config.ts` and
  requires explicit adapters — for a 2-day spike I downgraded to Prisma 6
  for the familiar `env("DATABASE_URL")` pattern.
- Angular 21's standalone routes with `loadComponent` + signals removes most of
  the boilerplate Angular was previously known for; ergonomics feel closer to
  Vue/Nuxt than I expected.
- NestJS DTOs with `class-validator` + `class-transformer` give the same
  validation ergonomics as Laravel Form Requests — write once, validate
  everywhere.

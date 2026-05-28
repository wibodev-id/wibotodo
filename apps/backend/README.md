# ttodo — backend

NestJS API for the ttodo todo list app. See the [root README](../../README.md)
for the full project overview.

## Quick start

```bash
# from project root
pnpm db:up               # start Postgres container
cd apps/backend
cp .env.example .env     # first time only
pnpm exec prisma migrate dev
pnpm start:dev           # http://localhost:3000  +  /api swagger docs
```

## Module layout

```
src/
├── auth/                # register, login, JWT strategy, guard
├── todos/               # CRUD + filter (today/week/overdue/completed)
├── uploads/             # Multer disk storage + serve
├── prisma/              # global PrismaService
└── common/decorators/   # @CurrentUser()
```

## Scripts

- `pnpm start:dev` — dev mode with watch
- `pnpm build` — compile to `dist/`
- `pnpm start:prod` — run compiled output
- `pnpm exec prisma migrate dev` — create + apply a new migration
- `pnpm exec prisma studio` — visual DB browser

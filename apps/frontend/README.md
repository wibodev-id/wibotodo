# ttodo — frontend

Angular 21 SPA for the ttodo todo list app. See the [root README](../../README.md)
for the full project overview.

## Quick start

```bash
# from project root (assumes backend is running)
cd apps/frontend
pnpm start               # http://localhost:4200
```

## Architecture

- **Standalone components + signals** throughout — no NgModules.
- **Lazy routes** for `/login`, `/register`, `/todos` via `loadComponent`.
- **Functional interceptor + guards** (`HttpInterceptorFn`, `CanActivateFn`).
- **Tailwind v4** via `@tailwindcss/postcss`.

```
src/app/
├── core/
│   ├── models/          # Todo, AuthUser types
│   ├── services/        # AuthService, TodoService, UploadService
│   ├── interceptors/    # auth.interceptor (attach token, handle 401)
│   └── guards/          # authGuard, guestGuard
└── features/
    ├── auth/            # login.component.ts, register.component.ts
    └── todos/           # todos-page, todo-form, todo-item
```

## Scripts

- `pnpm start` — dev server on port 4200
- `pnpm build` — production build to `dist/frontend/`
- `pnpm test` — run vitest

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Vietnamese real estate platform ("Bất động sản" / nhatranglands.vn) — property listings (sale/rent), news/blog, agent profiles, bookings. npm-workspaces monorepo with three deployable apps sharing one Postgres database:

- `backend/` — NestJS 10 REST API (TypeScript)
- `frontend_client/` — public-facing site, Next.js 15 (JavaScript, "sheltos-next-template")
- `frontend_admin/` — admin/agent dashboard, Next.js 15 (JavaScript, "sheltos-next-admin")
- `shared/` — `@batdongsan/shared`, CommonJS constants (price/area ranges, property status) consumed by all three apps — edit here, not per-app copies

Root `package.json` only declares the workspaces; it has no scripts. Run scripts inside each app's folder, or with `npm run <script> -w <workspace>` from root.

Note: `README.md`, `CAU_TRUC_DU_AN.md`, `SETUP.md` at repo root are early **design docs** — they describe a planned Tailwind/generic Next.js structure. The actual apps diverged significantly (see Architecture below); trust the code over these docs.

## Commands

### Backend (`backend/`, NestJS + Prisma 7 + PostgreSQL)
```
npm run start:dev        # dev server w/ watch, http://localhost:3000, Swagger at /api/docs
npm run build            # nest build
npm run lint              # eslint --fix on src/apps/libs/test
npm run test              # jest, unit tests (*.spec.ts colocated in src/)
npm run test -- <path>    # run a single test file
npm run test:watch
npm run test:e2e          # e2e, config in test/jest-e2e.json
npm run prisma:generate   # after editing prisma/schema.prisma
npm run prisma:migrate    # prisma migrate dev
npm run prisma:studio
```

### frontend_admin / frontend_client (Next.js 15, JS not TS)
```
npm run dev     # admin: port 3001, client: port 3002 (fixed via -p flag in script)
npm run build
npm run start
npm run lint     # next lint — no test suite in either frontend
```

### Full stack via Docker (dev)
```
docker compose up          # postgres + backend + both frontends + nginx, from root docker-compose.yml
```
`docker-compose.deploy.yml` is the production compose file used by CI/CD on the VPS (see Deployment below) — don't confuse the two.

## Architecture

### Backend module layout (`backend/src/`)
Standard NestJS feature-module structure, each with its own `.module/.controller/.service` (+`dto/`): `auth`, `properties`, `news`, `locations`, `file`, `users`, `mail`, `booking`, plus `prisma/` for the DB service. All registered in `app.module.ts`.

- **Auth**: Passport JWT (`auth/strategies/jwt.strategy.ts`, `guards/jwt-auth.guard.ts`) + local strategy for login. No roles/permissions guard currently exists despite being referenced in the old design docs — authorization is just "authenticated or not" today.
- **Prisma**: `prisma/prisma.service.ts` uses the driver adapter pattern (`@prisma/adapter-pg` + `pg.Pool`), not the default Prisma engine connection — required because of Prisma 7. Config lives in `backend/prisma.config.ts` (not `schema.prisma`'s deprecated env block).
- **File storage**: `file/file.service.ts` talks to **Cloudflare R2** via the S3 SDK (`@aws-sdk/client-s3`), not local disk — configured through `R2_ENDPOINT/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY/R2_BUCKET/R2_PUBLIC_BASE_URL`. The service no-ops (uploads disabled, deletes silently skipped) if these env vars are absent, rather than throwing at boot. The `upload/` module directory exists but is currently empty — `file/` is the module actually in use.
- **main.ts**: CORS is an explicit allowlist (localhost:3000-3002 + nhatranglands.vn/admin.nhatranglands.vn) merged with `CORS_ORIGIN` env var, not a wildcard — check this list when adding a new frontend origin. Global prefix is `/api`; global `ValidationPipe` has `whitelist`+`forbidNonWhitelisted` on, so DTOs must declare every field explicitly or requests get rejected.
- **Schema** (`backend/prisma/schema.prisma`): key models are `properties`, `news`, `locations` (self-referential province/district/ward tree via `parent_id`+`level`), `users`, `favorites`, `tags`, `file_attach` (generic attachment table keyed by `object_id`+`nghiepvu_code`, not FK'd to a specific entity — this is a legacy-style polymorphic association, be careful when querying/joining).

### Frontend apps
Both frontends are built on the same purchased "Sheltos" Next.js template (Bootstrap/reactstrap + SCSS, not Tailwind) and are **plain JavaScript** (`jsconfig.json`, no TypeScript) despite the design docs assuming TS — don't introduce `.ts`/`.tsx` files expecting the existing tooling to typecheck them.

- `frontend_admin` (port 3001): route groups `(Auth)` and `(Mainbody)` under `src/app/`; feature areas under `(Mainbody)`: `dashboard`, `myproperties`, `manage-users`, `booking`, `news`, `agents`, `map`, `payments`, `reports`, `types`. Each has a mirrored folder in `src/components/`. Uses TinyMCE (via `/api/tinymce-key` route to avoid exposing the key client-side) and Leaflet for maps.
- `frontend_client` (port 3002): route group `(Mainbody)` covers `home`, `batdongsan` (listings), `duanbds`, `dulich`, `news`, `user-profile`, `authen`, `pages`. Has i18n (`app/i18n/`, multiple locale JSON files) and Redux Toolkit (`redux-toolkit/reducers/`) for client state, unlike the admin app which doesn't use Redux.
- Both call the NestJS API through `src/lib/api/` wrappers using `NEXT_PUBLIC_API_URL`; `frontend_client` additionally has `lib/api/mappers/` to reshape API responses for its component props.

### Deployment
GitHub Actions (`.github/workflows/deploy.yml`) on push to `main`: `security-audit` job (npm audit, gates the rest of the pipeline on critical vulnerabilities) → build+push all 3 Docker images to GHCR → SSH deploy to VPS using `docker-compose.deploy.yml` + `scripts/deploy.sh`. nginx (`nginx/nginx.conf`) terminates TLS and reverse-proxies `nhatranglands.vn` → frontend_client:3002, `admin.nhatranglands.vn` → frontend_admin:3001, `api.nhatranglands.vn` → backend:3000.

**Security note**: production was compromised in June 2026 via an unpatched Next.js RCE (both frontends were on 15.1.x). Keep `frontend_admin`/`frontend_client`'s `next` version current and never let it drift below what `npm audit` reports as clean — the CI `security-audit` job exists specifically to catch this before deploy. Always keep root `package-lock.json` committed (a missing/stale lockfile was the original drift vector).

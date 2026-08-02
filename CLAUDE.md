# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Menu Planner ("repas-planner") is a weekly meal-planning app: manage recipes, generate a non-repetitive weekly menu, and produce a shopping list that accounts for existing stock. Backend is Node.js/Express/TypeScript with PostgreSQL (via `pg` + `node-pg-migrate`). Frontend is Vue 3 + TypeScript + Tailwind, built with Vite. The two are independent npm projects under `backend/` and `frontend/`, with no shared package or workspace tooling — run their commands from within each directory.

## Commands

All commands are run from within `backend/` or `frontend/` respectively (there is no root package.json).

### Backend (`backend/`)
- `npm run dev` — run the server with hot reload (`ts-node-dev`)
- `npm run build` — compile TypeScript to `dist/`
- `npm run lint` — ESLint over `src/**/*.ts` and `tests/**/*.ts`
- `npm run test` — run vitest with coverage (coverage gate is `src/app.ts` only, see `vitest.config.ts`)
- `npx vitest run tests/menu.test.ts` — run a single test file
- `npx vitest run -t "test name"` — run tests matching a name
- `npm run migrate:create <name>` — scaffold a new migration in `migrations/`
- `npm run migrate:up` / `npm run migrate:down` — apply/revert migrations (needs `DATABASE_URL`)
- Local Postgres for development: `docker compose -f backend/docker-compose.dev.yml up -d`
- Config: copy `backend/.env.example` to `backend/.env` (`DATABASE_URL`, optionally `AUTH_USERNAME`/`AUTH_PASSWORD`, `PORT`)

### Frontend (`frontend/`)
- `npm run dev` — Vite dev server (expects backend at `http://localhost:3000` in dev, see `src/api.ts`)
- `npm run build` — type-check (`vue-tsc -b`) then `vite build`
- `npm run lint` — ESLint over `src/**/*.{ts,vue}`
- `npm run test` — vitest with coverage (jsdom environment)
- `npx vitest run src/week.test.ts` — run a single test file

CI (`.github/workflows/ci.yml`) runs lint, test, and build for both projects on every push/PR to `main` — mirror that sequence locally before pushing.

## Architecture

### Backend request flow (`backend/src/app.ts`)
Express app wires middleware then routers in this order: JSON body parsing → CORS → cookie parsing → `/api/login`, `/api/logout`, `/api/auth-required` (always public) → `authMiddleware` gate on all other `/api/*` → static frontend files → the resource routers (`recipes`, `ingredients`, `unites`, `stock`, `menus`) → a catch-all that serves `index.html` (SPA fallback). In production the compiled frontend is served from the same Express process (`FRONTEND_PATH`, defaults to `dist/public`, set by the Dockerfile).

### Auth (`backend/src/auth.ts`)
Auth is opt-in: `isAuthEnabled()` is true only when both `AUTH_USERNAME` and `AUTH_PASSWORD` env vars are set. When disabled, every `/api` route is public. When enabled, login issues an in-memory random session token stored in an httpOnly cookie (`sessions` is a plain in-process `Set` — not persisted, doesn't survive restarts, doesn't scale beyond one instance). The frontend calls `GET /api/auth-required` once per app load (`frontend/src/router.ts`) and gates all routes except `/login` on both that flag and a `localStorage.loggedIn` marker; `apiFetch` (`frontend/src/api.ts`) redirects to `/login` on any 401.

### Domain model and menu generation
Core entities: `ingredients`, `recipes` (each with an `ingredient_principal_id` and optional `ingredient_secondaire_id`), `recipe_ingredients` (join table with quantity/unit), `unites` (units of measure), `menus` (one per ISO week string like `2026-W05`), `menu_recipes` (recipe assigned to a day/moment), and `stock` (current quantity on hand per ingredient).

Menu generation (`backend/src/menu.ts::generateMenuEntries`) is pure and unit-tested in isolation from the DB: given all recipes (annotated with `last_used` week) and a `Selection` of which day/moment slots are requested, it greedily assigns recipes ordered by least-recently-used, skipping a recipe whose main ingredient was already used this week, and capping any secondary ingredient at 2 uses/week. The route handler (`backend/src/routes/menus.ts`) wraps this in a transaction: upsert the `menus` row for the week, clear old `menu_recipes`, fetch recipe/last-used data, call `generateMenuEntries`, then persist. Marking a menu slot "done" (`POST /:week/:jour/:moment/done`) decrements `stock` by each ingredient's recipe quantity (floored at 0). The shopping list query aggregates required quantities per ingredient across the week's recipes and subtracts current stock to compute what's missing.

When ingredients/units are referenced by name rather than id (e.g. recipe import, or a user typing a new ingredient), `findOrCreateUnite` (`backend/src/unite.ts`) and the inline equivalent in `routes/recipes.ts` look up-or-insert by name to avoid duplicates. Recipe update/delete also garbage-collect orphaned `ingredients`/`unites` rows no longer referenced by any recipe.

### Frontend structure
- `src/api.ts` is the single point of contact with the backend — all HTTP calls, response typing, and the `apiFetch` wrapper (adds credentials, handles 401) live here. New backend endpoints should get a typed wrapper added here rather than calling `fetch` from components.
- `src/router.ts` defines all routes and the auth guard (see Auth above).
- `src/week.ts` converts between `Date` and ISO week strings (`YYYY-Www`) used as the menu's primary key everywhere (URLs, API paths, DB `semaine` column) — the ISO week definition (weeks start Monday, week 1 contains Jan 4th) must stay consistent between `weekRange`/`weekString` here and the backend, since nothing enforces it across the boundary.
- `src/i18n.ts` sets up `vue-i18n`, auto-detecting locale from `navigator.language` (falls back to `en`); translated strings live in `src/locales/{en,fr}.json` and must be added to both.
- `src/pages/` holds one component per route; `src/components/` holds shared pieces (e.g. `IngredientInput.vue`, an autocomplete-style ingredient/quantity/unit picker used when building recipes).

### Database migrations
Schema changes go through `node-pg-migrate` files in `backend/migrations/`, applied in filename (timestamp) order. Existing migrations show the pattern: `create-schema` (initial tables), then additive migrations (`add-image-to-recipes`, `add-moment-to-menu-recipes`, `add-unite-to-ingredients`, `create-unites-table`, `create-stock-table`). Note `recipe_ingredients` originally stored unit as free text (`unite` column) before `unites` became a normalized table (`unite_id` FK) — both `unite` (text) and `unite_id` references appear across the codebase depending on age of the code path; check the relevant migration before assuming which one a table/query uses.

### Docker / deployment
`Dockerfile` is a multi-stage build: compiles backend and frontend separately, then copies backend's compiled `dist/`, the frontend's built assets (into `dist/public`), migrations, and `docker/entrypoint.sh` into a single `node:20-slim` production image. `entrypoint.sh` runs migrations before starting the server. Root `docker-compose.yml` is the production stack (app + Postgres); `backend/docker-compose.dev.yml` is Postgres-only for local dev against `npm run dev`.

# 🍽️ Menu Planner

## Overview
Menu Planner is a little helper that takes the pain out of figuring out what to eat every week. It manages your recipes, juggles ingredients and spits out a shopping list so you can focus on more important things – like eating.

## Why Menu Planner?
Spending every Sunday night staring at an empty calendar wondering what to cook? Same here. This tool was born to cut down the mental load of meal planning, add variety to your diet and keep you from getting stuck in a pasta-every-night rut.

## Key Features
- Create recipes with ingredients (quantity + unit)
- Mark a main and optional secondary ingredient for each recipe
- Generate a weekly menu without repeating main or secondary ingredients
- Take past menus into account to maximize variety
- Produce a shopping list based on the week's plan

## How It Works
The backend runs on **Node.js** with **TypeScript**, using **Express** and **pg** to connect to **PostgreSQL**. Migrations are handled by `node-pg-migrate` and development uses `ts-node-dev` for hot reloading. The frontend is built with **Vue.js**, TypeScript and Tailwind CSS. Everything can be packaged in **Docker** for easy deployment.

## Project Structure
```
backend/   # Node.js API and database migrations
frontend/  # Vue application
.github/   # CI workflows
Dockerfile # Build container image
```
The root `docker-compose.yml` spins up the production app while `backend/docker-compose.dev.yml` provides a handy PostgreSQL instance for local development.

## Deployment
Want to try it out? Clone the repo and run:
```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: repas
      POSTGRES_PASSWORD: repas
      POSTGRES_DB: repas
    volumes:
      - db-data:/var/lib/postgresql/data
  app:
    image: danielsilvestre37/repas-planner:latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://repas:repas@db:5432/repas
    depends_on:
      - db
volumes:
  db-data:
```
Then simply run:
```bash
docker compose up -d
```
And you’re ready to get cooking (figuratively and literally).

## Development
Backend commands:
- `npm run dev` – run the server with hot reload
- `npm run build` – compile TypeScript
- `npm run lint` – run ESLint
- `npm run test` – run unit tests with coverage
- `npm run migrate:create` – create a new database migration
- `npm run migrate:up`/`npm run migrate:down` – apply or revert migrations

Frontend commands:
- `npm run dev` – start the Vite dev server
- `npm run build` – build for production
- `npm run lint` – run ESLint
- `npm run test` – run unit tests with coverage

For local development, start PostgreSQL with:
```bash
docker compose -f backend/docker-compose.dev.yml up -d
```

## Authentication

Menu Planner supports optional cookie‑based authentication. To enable it, set the
environment variables `AUTH_USERNAME` and `AUTH_PASSWORD` for the backend. If
these variables are not defined, all API endpoints are publicly accessible.

When authentication is enabled:

- `POST /api/login` accepts `{ "username": "<name>", "password": "<pass>" }` and
  returns a session cookie on success.
- `POST /api/logout` clears the session cookie.
- `GET /api/auth-required` indicates whether authentication is active.
- All other `/api` routes return **401 Unauthorized** if the cookie is missing or
  invalid.

The frontend checks this flag on startup and redirects unauthenticated users to
the login page when needed.

## License
Menu Planner is released under the [MIT License](LICENSE).

## Author
Maintained with love (and plenty of snacks) by [@valcriss](https://github.com/valcriss).

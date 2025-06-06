# 🍽️ Repas Planner

**Repas Planner** is a personal tool designed to simplify weekly meal planning and reduce the mental load associated with organizing meals and grocery shopping.

## 🎯 Project Goals

- Allow creation of a recipe list with ingredients (quantity + unit).
- Assign one **main ingredient** (mandatory) and one **secondary ingredient** (optional) per recipe.
- Automatically generate a **weekly menu** that:
  - Avoids repeating any main or secondary ingredient within the same week.
  - Takes past menus into account to improve variety.
- Automatically generate a **shopping list** based on the weekly menu.
- Help reduce food waste and improve grocery budgeting.

---

## 🛠️ Tech Stack

- **Backend**: Node.js + TypeScript (CommonJS)
- **Database**: PostgreSQL
- **Migrations**: [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate)
- **Web Server**: Express
- **Local Development**: `ts-node-dev`
- **Frontend (planned)**: Vue.js + Tailwind CSS
- **Deployment (planned)**: Docker

---

## ✅ Features Implemented

### Database
- Database schema includes:
  - `ingredients`
  - `recipes`
  - `recipe_ingredients`
  - `menus`
  - `menu_recipes`
- Schema managed using `node-pg-migrate`
- Environment file `.env` used for PostgreSQL connection

### Backend
- Express server up and running
- Basic routes implemented (`GET /recipes`, `POST /recipes`)
- Development run using `ts-node-dev`

---

## 🧩 Features To Be Implemented

### Backend
- 🔲 Connect to PostgreSQL using `pg`
- 🔲 Full read/write support for:
  - Recipe creation with ingredients
  - Recipe listing
  - Weekly menu creation and retrieval
- 🔲 Automatic weekly menu generation with constraints
- 🔲 Grocery list generation from weekly menu

### Frontend (to be developed)
- 🔲 Responsive UI with Vue.js
- 🔲 Recipe editor
- 🔲 Weekly menu display and editing
- 🔲 Shopping list display
- 🔲 History view of previous weeks

### Miscellaneous
- 🔲 Docker support for production
- 🔲 Simple local authentication (optional)
- 🔲 PDF export/printing of menu and shopping list (optional)

---

## ▶️ Getting Started

### Requirements

- Node.js ≥ 20
- PostgreSQL ≥ 13

### Installation

```bash
cd backend
npm install
```

### Tests
```bash
npm test
```

Code coverage for TypeScript sources is generated in `backend/coverage`.

### Linting

```bash
npm run lint
```

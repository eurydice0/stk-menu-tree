# STK Menu Project

A full-stack menu management system built as a **Technical Screening Test (STT)** deliverable.
- **Backend**: NestJS API server with TypeORM + MySQL, Swagger docs.
- **Frontend**: Next.js 16 + Tailwind CSS UI for tree-view menu management.

## Stack Overview & Rationale

| Layer      | Tech           | Reason                                             |
|------------|----------------|----------------------------------------------------|
| Backend    | NestJS         | Structured modular architecture, built-in DI, Swagger support |
| ORM        | TypeORM        | Supports MySQL, easy entity/relations, migrations |
| Database   | MySQL 8.4      | Relational structure fits hierarchical menu data with FK integrity |
| Frontend   | Next.js 16     | App router, SSR-friendly, great DX |
| Styling    | Tailwind CSS   | Rapid iteration, consistent utility-first classes |
| Icons      | Lucide React   | Lightweight, consistent icon set |
| Container  | Docker         | Reproducible environments for dev and prod |

---

## Prerequisites

- Node.js v24+
- npm 11+
- MySQL 8.x (local install or Docker)
- Docker & Docker Compose (optional, for containerized setup)

---

## Setup

### 1. Configure environment variables

Backend: copy `.env.example` to `.env` and adjust values.

Frontend: create `.env.local` in `my-porto`:

```ini
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 2. Initialize the database

Using local MySQL:

```bash
mysql -u root -p < stk-menu-api/migrations/001_create_menus_table.sql
```

Or via docker-compose (see below) which auto-loads the schema.

---

## Running Locally (npm)

### Start Backend API

```bash
cd stk-menu-api
npm install
npm run start:dev          # hot-reload development mode
```

Swagger docs: [http://localhost:3000/api](http://localhost:3000/api)

### Start Frontend UI

```bash
cd my-porto
npm install
npm run dev                # http://localhost:3001
```

Menu Manager UI: [http://localhost:3001/menus](http://localhost:3001/menus)

---

## Running via Docker Compose (Production-like)

```bash
cd stk-menu-api
docker compose up --build    # starts MySQL + API + UI
```

Services:
- MySQL on port `3306`
- NestJS API on port `3000` ([Swagger](http://localhost:3000/api))
- Next.js Frontend on port `3001` ([Menu UI](http://localhost:3001/menus))

---

## API Endpoints

All endpoints are prefixed with `/api/menus`.

| Method   | Path                    | Description                                          |
|----------|-------------------------|------------------------------------------------------|
| `GET`    | `/menus`                | Get all menus as a nested tree structure             |
| `GET`    | `/menus/:id`            | Get a specific menu item by ID                       |
| `POST`   | `/menus`                | Create a new menu item                               |
| `PUT`    | `/menus/:id`            | Update a menu item                                   |
| `DELETE` | `/menus/:id`            | Delete a menu item **and all its children recursively** |
| `PATCH`  | `/menus/:id/move`       | Move a menu to a different parent/position           |
| `PATCH`  | `/menus/:id/reorder`    | Reorder menu items by providing ordered IDs          |

> Interactive documentation: [Swagger UI](http://localhost:3000/api)

---

## Seed Data

Populate the database with sample menus:

```bash
cd stk-menu-api
npm run build
node dist/seed.js
```

Sample data:
- Root menus: Dashboard, Users, Settings, Profile
- Nested: User List, User Roles, General Settings, Security Settings, Account

---

## Frontend Features

- **Tree View**: Expand/collapse each node individually or globally (Expand All / Collapse All).
- **CRUD Operations**:
  - Create: Add new menu at any level (root or nested).
  - Read: View menu details in the right-hand detail form.
  - Update: Edit via modal dialog.
  - Delete: Confirmation dialog with recursive child-deletion warning.
- **Responsive Design**: Works on desktop and mobile.
- **Search Filter**: Dynamically filter the tree.
- **Loading & Error States**: Visual feedback during data fetch.
- **Detail Panel**: Right-side panel shows selected menu info and actions.

---

## Environment Variables Reference

### Backend (`.env`)

```ini
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=stk_menu
DB_SYNCHRONIZE=true
```

### Frontend (`my-porto/.env.local`)

```ini
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

---

## License

UNLICENSED. Developed as a technical screening test.
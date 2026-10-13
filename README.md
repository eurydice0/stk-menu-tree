# STK Menu Tree

Fullstack hierarchical menu management system. Technical test for Solusi Teknologi Kreatif.

## Tech Stack

- **Backend:** NestJS, TypeORM, MySQL, Swagger
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, Lucide React

## Project Structure

```text
stk-menu-tree/
├── backend/    # NestJS API (port 3001)
├── frontend/   # Next.js UI (port 3000)
└── docs/       # Screenshots and demo assets
```

## Quickstart

### 1. Database

Create MySQL database and run migration:

```sql
CREATE DATABASE stk_menu;
```

```bash
mysql -u root -p stk_menu < backend/migrations/001_create_menus_table.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

Swagger UI: `http://localhost:3001/api`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000/menus`

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/menus` | Get all menus as nested tree |
| `GET` | `/api/menus/:id` | Get menu by ID |
| `POST` | `/api/menus` | Create menu |
| `PUT` | `/api/menus/:id` | Update menu |
| `DELETE` | `/api/menus/:id` | Delete menu and all children |
| `PATCH` | `/api/menus/:id/move` | Move menu to parent/position |
| `PATCH` | `/api/menus/:id/reorder` | Reorder menus by ID list |

## Features

- Unlimited depth hierarchical menu tree
- CRUD at any level with validation
- Expand/collapse, search filter
- Move menu between parents, reorder via API
- Delete confirmation dialog, cascade delete
- Responsive desktop and mobile layouts
- Loading and error states
- Swagger API documentation

## Screenshots

See `docs/screenshots` for demo captures.
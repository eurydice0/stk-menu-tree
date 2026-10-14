# STK Menu Tree

Fullstack hierarchical menu management system. Technical test for Solusi Teknologi Kreatif.

## Prerequisites

- Node.js >= 18
- MySQL 8.0+ (or Docker)
- npm

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

## Setup Instructions

### 1. Database

Create a MySQL database, then configure the backend:

```bash
cd backend
cp .env.example .env
```

Edit `.env` to match your MySQL credentials:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=stk_menu
DB_SYNCHRONIZE=true
```

### 2. Backend

```bash
cd backend
npm install
npm run start:dev
```

Backend runs on **http://localhost:3001**
Swagger API docs: **http://localhost:3001/api**

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
```

The frontend `.env.local` points to `http://localhost:3001`. Now install and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000/menus**

### 4. Database Migration (Optional)

If `DB_SYNCHRONIZE=true`, the database schema is created automatically. To run the migration manually:

```bash
mysql -u root -p stk_menu < backend/migrations/001_create_menus_table.sql
```

## Docker Compose (Alternative)

To run MySQL in Docker:

```bash
docker-compose up -d
```

Then start the backend and frontend using `npm run start:dev` and `npm run dev`.

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
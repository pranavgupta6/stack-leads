# Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack and TypeScript.
Manage leads, track status, filter and search, export data, and control access
by role — all in a clean, responsive UI with dark mode support.

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- TailwindCSS
- React Router DOM v6
- React Hook Form + Zod
- Axios
- Zustand (state management)

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Zod (validation)

### DevOps
- Docker + Docker Compose
- Nginx (frontend serving + API proxy)

---

## Features

- JWT-based authentication (Register / Login / Protected Routes)
- Role-Based Access Control (Admin / Sales)
- Leads CRUD — Create, Read, Update, Delete
- Advanced filtering — Status, Source, Search (debounced), Sort
- Backend pagination — 10 records per page
- CSV Export (Admin only)
- Responsive design — mobile to desktop
- Dark mode (persists across sessions)
- Loading states, empty states, error handling throughout
- Docker setup — one command to run everything

---

## Prerequisites

Make sure you have these installed:
- Node.js v18+
- npm v9+
- MongoDB (for local setup without Docker)
- Docker + Docker Compose (for Docker setup)

---

## Setup — Option 1: Local Development

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smart-leads-dashboard
```

### 2. Set up the backend
```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` and fill in your values:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/smartleads
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
```

Start the backend:
```bash
npm run dev
```
Server runs at: http://localhost:5000

### 3. Set up the frontend
```bash
cd ../client
npm install
cp .env.example .env
```

Edit `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```
App runs at: http://localhost:5173

---

## Setup — Option 2: Docker (Recommended)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd smart-leads-dashboard
```

### 2. Set up environment
```bash
cp .env.example .env
```

Edit `.env` at the root:
```env
JWT_SECRET=your_super_secret_key_here
```

### 3. Start everything
```bash
docker-compose up --build
```

That's it. The following will be running:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

### 4. Stop
```bash
docker-compose down
```

To also remove the database volume:
```bash
docker-compose down -v
```

---

## Default Test Accounts

After starting the app, register these accounts manually via the UI or API:

| Role  | Email              | Password    |
|-------|--------------------|-------------|
| Admin | admin@test.com     | password123 |
| Sales | sales@test.com     | password123 |

Admin can see all leads and export CSV.
Sales users can only see and manage their own leads.

---

## Project Structure

```
smart-leads-dashboard/
├── client/                  # React frontend
│   ├── src/
│   │   ├── api/             # Axios instance + API functions
│   │   ├── components/      # Reusable UI + Lead components
│   │   ├── context/         # Auth context
│   │   ├── hooks/           # useDebounce
│   │   ├── pages/           # Login, Register, Dashboard, Leads, LeadDetail
│   │   ├── types/           # Shared TypeScript interfaces
│   │   └── utils/           # CSV export utility
│   ├── Dockerfile
│   └── nginx.conf
├── server/                  # Express backend
│   ├── src/
│   │   ├── config/          # Database connection
│   │   ├── controllers/     # Auth + Lead controllers
│   │   ├── middleware/       # Auth, Role, Error middleware
│   │   ├── models/          # User + Lead Mongoose models
│   │   ├── routes/          # Auth + Lead routes
│   │   ├── types/           # Extended Express types
│   │   └── utils/           # ApiError class
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md

API Documentation
See API.md for full endpoint documentation.

Environment Variables
Server (server/.env)
VariableDescriptionExamplePORTServer port5000NODE_ENVEnvironmentdevelopmentMONGO_URIMongoDB connection stringmongodb://localhost:27017/smartleadsJWT_SECRETSecret key for JWT signingsupersecretkeyJWT_EXPIRES_INJWT expiry duration7d
Client (client/.env)
VariableDescriptionExampleVITE_API_BASE_URLBackend API base URLhttp://localhost:5000/api

Scripts
Backend
CommandDescriptionnpm run devStart dev server with hot reloadnpm run buildCompile TypeScript to JavaScriptnpm startRun compiled production build
Frontend
CommandDescriptionnpm run devStart Vite dev servernpm run buildBuild for productionnpm run previewPreview production build locally

---

If you'd like, I can now run the TypeScript audits and fix any errors found.

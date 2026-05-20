# CLAUDE.md — Smart Leads Dashboard
## Full Stack Internship Assignment (ServiceHive)

> **Purpose of this file:** This is a complete technical specification and build guide for the Smart Leads Dashboard — a MERN stack project for an internship selection assignment. Read everything before writing a single line of code.

---

## 0. Meta — Submission Details

- **Submission email:** ritik.yadav@servicehive.tech
- **Email subject:** `MERN Internship Assignment Submission - Pranav Gupta`
- **What to submit:** GitHub repo URL, updated resume, README.md, .env.example, API docs, setup instructions, deployment link (preferred)

---

## 1. Tech Stack (STRICT — No Deviations)

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React.js (v18+) |
| Language | **TypeScript** (MANDATORY — JS will be rejected) |
| Styling | TailwindCSS |
| State | React Context or Zustand (preferred) |
| HTTP Client | Axios |
| Routing | React Router DOM v6 |

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js (v18+) |
| Framework | Express.js |
| Language | **TypeScript** (MANDATORY) |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcrypt |

### DevOps
| Tool | Purpose |
|------|---------|
| Docker + Docker Compose | Containerization (MANDATORY) |
| dotenv | Environment config |

### TypeScript Rules (CRITICAL — Automatic rejection if violated)
- All files must be `.ts` / `.tsx`
- Proper interfaces and types for every model, prop, API response
- **Minimize `any`** — justify every use with a comment if unavoidable
- Use `unknown` instead of `any` where possible
- No implicit `any` — enable `strict: true` in tsconfig

---

## 2. Project Structure

### Recommended Monorepo Layout

```
smart-leads-dashboard/
├── client/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/                   # Axios instances & API functions
│   │   │   └── leadsApi.ts
│   │   │   └── authApi.ts
│   │   ├── components/            # Reusable UI components
│   │   │   ├── ui/                # Button, Input, Badge, Modal, etc.
│   │   │   ├── leads/             # LeadCard, LeadForm, LeadTable, etc.
│   │   │   └── layout/            # Navbar, Sidebar, PageWrapper
│   │   ├── context/               # Auth context, etc.
│   │   ├── hooks/                 # useDebounce, useLeads, useAuth, etc.
│   │   ├── pages/                 # LoginPage, RegisterPage, DashboardPage, LeadsPage
│   │   ├── types/                 # All shared TypeScript interfaces
│   │   │   └── index.ts
│   │   ├── utils/                 # csvExport, formatDate, etc.
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                        # Express backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   └── leadController.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts  # JWT verification
│   │   │   ├── roleMiddleware.ts  # RBAC enforcement
│   │   │   └── errorMiddleware.ts # Centralized error handler
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   └── Lead.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   └── leadRoutes.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── ApiError.ts        # Custom error class
│   │   └── index.ts               # App entry point
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 3. Database Models

### User Model (`server/src/models/User.ts`)

```typescript
interface IUser {
  _id: ObjectId;
  name: string;
  email: string;             // unique, lowercase
  password: string;          // bcrypt hashed
  role: 'admin' | 'sales';
  createdAt: Date;
  updatedAt: Date;
}
```

**Mongoose Schema notes:**
- `email`: unique, required, lowercase, trim
- `password`: required, minlength 6, select: false (don't return in queries by default)
- `role`: enum ['admin', 'sales'], default: 'sales'
- Add timestamps: true

### Lead Model (`server/src/models/Lead.ts`)

```typescript
interface ILead {
  _id: ObjectId;
  name: string;
  email: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  source: 'Website' | 'Instagram' | 'Referral';
  createdBy: ObjectId;       // ref: 'User'
  createdAt: Date;
  updatedAt: Date;
}
```

**Mongoose Schema notes:**
- `name`: required, trim
- `email`: required, trim, validate with regex
- `status`: enum, default: 'New'
- `source`: enum, required
- `createdBy`: ObjectId, ref: 'User', required
- Add timestamps: true
- Add indexes on `status`, `source`, `name`, `email` for fast filtering

---

## 4. Authentication System

### Endpoints

```
POST /api/auth/register     — Create new user
POST /api/auth/login        — Login, returns JWT
GET  /api/auth/me           — Get current user (protected)
```

### Registration Flow
1. Validate body: name, email, password (min 6 chars), role
2. Check if email already exists → 409 Conflict
3. Hash password with `bcrypt.hash(password, 10)`
4. Save user
5. Return JWT + user object (without password)

### Login Flow
1. Find user by email (use `.select('+password')` since password is `select: false`)
2. Compare with `bcrypt.compare()`
3. If invalid → 401 Unauthorized
4. Sign JWT: `jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '7d' })`
5. Return token + user

### JWT Middleware (`authMiddleware.ts`)
```typescript
// Attach req.user after verifying token
// Return 401 if no token or invalid
// Token sent in: Authorization: Bearer <token>
```

### Password Rules
- Min 6 characters
- Hash with bcrypt, saltRounds: 10
- Never store or return plaintext

---

## 5. Role-Based Access Control (RBAC)

### Roles
| Role | Permissions |
|------|------------|
| `admin` | Full CRUD on all leads, export CSV, view all users' leads |
| `sales` | Create leads, view/edit/delete only their own leads, no user management |

### Implementation
- Role stored in JWT payload
- `roleMiddleware.ts`: takes allowed roles array, returns 403 if not permitted
- Usage: `router.delete('/:id', protect, authorize('admin'), deleteLead)`
- Sales users: filter leads by `createdBy: req.user.id`
- Admin users: no `createdBy` filter — see all leads

---

## 6. Leads API

### Endpoints

```
GET    /api/leads           — Get leads (paginated, filtered, sorted)
GET    /api/leads/:id       — Get single lead
POST   /api/leads           — Create lead
PUT    /api/leads/:id       — Update lead
DELETE /api/leads/:id       — Delete lead
GET    /api/leads/export    — Export leads as CSV (admin only)
```

> All endpoints require JWT auth middleware.

### GET /api/leads — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Records per page (default: 10, fixed at 10) |
| `status` | string | Filter: New \| Contacted \| Qualified \| Lost |
| `source` | string | Filter: Website \| Instagram \| Referral |
| `search` | string | Search name OR email (case-insensitive regex) |
| `sort` | string | `latest` (default) or `oldest` |

### Pagination Logic (Backend — MANDATORY)
```typescript
const page = parseInt(req.query.page as string) || 1;
const limit = 10; // fixed
const skip = (page - 1) * limit;

const [leads, total] = await Promise.all([
  Lead.find(query).sort(sortOption).skip(skip).limit(limit),
  Lead.countDocuments(query)
]);

// Response metadata:
{
  data: leads,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1
  }
}
```

### Search + Filter Query Builder
```typescript
// All filters must work together (AND logic)
const query: FilterQuery<ILead> = {};

if (status) query.status = status;
if (source) query.source = source;
if (search) {
  query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ];
}

// RBAC: sales users only see their own
if (req.user.role === 'sales') {
  query.createdBy = req.user.id;
}

// Sort
const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
```

### Standard API Response Format
```typescript
// Success
{
  success: true,
  data: <payload>,
  pagination?: { ... }  // only for list endpoints
}

// Error
{
  success: false,
  message: "Human-readable error message",
  errors?: [...]        // validation errors if any
}
```

### HTTP Status Codes
| Situation | Code |
|-----------|------|
| Success (get/update) | 200 |
| Created | 201 |
| Bad Request / Validation | 400 |
| Unauthorized (no/bad token) | 401 |
| Forbidden (wrong role) | 403 |
| Not Found | 404 |
| Conflict (duplicate email) | 409 |
| Server Error | 500 |

---

## 7. CSV Export

- **Route:** `GET /api/leads/export`
- **Access:** Admin only
- **Behavior:** Apply same filters as GET /api/leads (status, source, search) but NO pagination — return ALL matching leads
- **Response headers:**
  ```
  Content-Type: text/csv
  Content-Disposition: attachment; filename="leads-export-<timestamp>.csv"
  ```
- **CSV columns:** Name, Email, Status, Source, Created At
- **Frontend:** "Export CSV" button visible only to admin; triggers download via Blob URL or direct link

### Frontend CSV utility (fallback if doing client-side)
```typescript
// utils/csvExport.ts
export const exportToCSV = (leads: Lead[], filename: string) => {
  const headers = ['Name', 'Email', 'Status', 'Source', 'Created At'];
  const rows = leads.map(l => [l.name, l.email, l.status, l.source, new Date(l.createdAt).toLocaleDateString()]);
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};
```

---

## 8. Frontend Pages & Components

### Pages

#### 1. `/login` — Login Page
- Email + password form
- Validation: required fields, valid email format
- On success: store JWT in localStorage, redirect to dashboard
- Show error toast on failure

#### 2. `/register` — Register Page
- Name, email, password, role (dropdown: admin/sales) fields
- Validation: all required, email format, password min 6
- On success: auto-login and redirect

#### 3. `/dashboard` — Dashboard Page (Protected)
- Summary cards: Total Leads, New Leads, Qualified Leads, Lost Leads
- Quick charts (optional): leads by status (could be simple CSS bars)
- Recent leads table (last 5)

#### 4. `/leads` — Leads Management Page (Protected)
- Filter bar: Status dropdown, Source dropdown, Search input (debounced)
- Sort toggle: Latest / Oldest
- Leads table with columns: Name, Email, Status, Source, Created At, Actions
- Pagination controls (prev/next, page numbers)
- "Add Lead" button → opens modal/drawer
- "Export CSV" button (admin only)
- Empty state when no leads match filters
- Loading skeleton while fetching

#### 5. `/leads/:id` — Lead Detail Page (Protected)
- Full lead info
- Edit button → inline edit or modal
- Delete button (with confirmation dialog)

### Key Reusable Components

```
components/ui/
  Button.tsx         — variants: primary, secondary, danger, ghost
  Input.tsx          — with label, error message
  Select.tsx         — styled dropdown
  Badge.tsx          — colored by status (New=blue, Contacted=yellow, Qualified=green, Lost=red)
  Modal.tsx          — accessible modal with backdrop
  Spinner.tsx        — loading indicator
  Toast.tsx          — success/error notifications
  Pagination.tsx     — page controls
  EmptyState.tsx     — illustration + message when no data
  ConfirmDialog.tsx  — "Are you sure?" dialog

components/leads/
  LeadTable.tsx      — full table with sort headers
  LeadForm.tsx       — create/edit form with validation
  LeadFilters.tsx    — filter bar (status, source, search, sort)
  LeadCard.tsx       — mobile card view

components/layout/
  Navbar.tsx         — top bar with user info + logout
  Sidebar.tsx        — navigation links
  ProtectedRoute.tsx — redirect to login if not authenticated
  RoleGuard.tsx      — hide/show based on role
```

---

## 9. Debounced Search (MANDATORY)

```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in LeadFilters.tsx
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 500);

useEffect(() => {
  // trigger API call with debouncedSearch
  fetchLeads({ search: debouncedSearch, page: 1, ...otherFilters });
}, [debouncedSearch]);
```

---

## 10. State Management

Use **React Context + useReducer** for auth state, or **Zustand** for leads state (simpler and more scalable).

### Auth Context
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}
```

- Store token in `localStorage`
- On app init, read token from localStorage, verify (decode) and set user
- Provide `isAuthenticated` and `user.role` for conditional rendering

### Leads State (Zustand example)
```typescript
interface LeadsStore {
  leads: Lead[];
  pagination: PaginationMeta;
  filters: LeadFilters;
  isLoading: boolean;
  error: string | null;
  setFilters: (filters: Partial<LeadFilters>) => void;
  fetchLeads: () => Promise<void>;
  createLead: (data: CreateLeadDto) => Promise<void>;
  updateLead: (id: string, data: UpdateLeadDto) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
}
```

---

## 11. TypeScript Interfaces (Shared Types)

Define all shared types in `client/src/types/index.ts` and `server/src/types/index.ts`.

```typescript
// Shared across frontend

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';
export type UserRole = 'admin' | 'sales';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: string | User;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: { field: string; message: string }[];
}

// DTOs
export interface CreateLeadDto {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
}

export type UpdateLeadDto = Partial<CreateLeadDto>;

export interface LeadFilters {
  page: number;
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: 'latest' | 'oldest';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
```

---

## 12. Error Handling

### Backend — Custom Error Class
```typescript
// utils/ApiError.ts
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Backend — Global Error Middleware
```typescript
// middleware/errorMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }
  // Mongoose validation errors
  // JWT errors
  // Default 500
  return res.status(500).json({ success: false, message: 'Internal server error' });
};
```

### Frontend Error Handling
- Axios interceptor: catch 401 → auto logout + redirect to login
- Try/catch in all async functions
- Error boundary component for unexpected crashes
- Show inline error messages in forms
- Toast notifications for API errors

---

## 13. Form Validation

### Backend (express-validator or zod)
Use `zod` for schema validation on every POST/PUT request body:
```typescript
import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email'),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Lost']),
  source: z.enum(['Website', 'Instagram', 'Referral']),
});
```

### Frontend
Use `react-hook-form` + `zod` resolver:
- Required field validation
- Email format
- Password min length
- Show per-field error messages below inputs
- Disable submit button while submitting

---

## 14. UI/UX Requirements

### Design System
- Use TailwindCSS for all styling — no inline styles
- Define custom colors in `tailwind.config.ts` for the status badges and brand color
- Responsive: works on mobile (375px) through desktop (1440px)

### Status Badge Colors
| Status | Color |
|--------|-------|
| New | Blue |
| Contacted | Yellow/Amber |
| Qualified | Green |
| Lost | Red |

### Loading States (MANDATORY)
- Skeleton loaders for table rows while fetching
- Spinner in buttons while submitting forms
- Disable all interactive elements while loading

### Empty States (MANDATORY)
- When no leads exist: illustration + "No leads yet. Create your first lead!" + CTA button
- When filters return nothing: "No leads match your filters. Try adjusting them."

### Bonus: Dark Mode
- Toggle in navbar
- Use `class="dark"` strategy with Tailwind dark mode
- Store preference in localStorage
- All components must have dark variants

---

## 15. Docker Setup (MANDATORY)

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  mongo:
    image: mongo:6
    container_name: leads_mongo
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password

  server:
    build: ./server
    container_name: leads_server
    ports:
      - '5000:5000'
    environment:
      - NODE_ENV=production
      - MONGO_URI=mongodb://root:password@mongo:27017/smartleads?authSource=admin
      - JWT_SECRET=${JWT_SECRET}
      - PORT=5000
    depends_on:
      - mongo

  client:
    build: ./client
    container_name: leads_client
    ports:
      - '3000:80'
    depends_on:
      - server

volumes:
  mongo_data:
```

### Server Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/index.js"]
```

### Client Dockerfile
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

---

## 16. Environment Variables

### `.env.example` (commit this, NOT `.env`)
```env
# Server
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/smartleads
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10

# Client (Vite)
VITE_API_BASE_URL=http://localhost:5000/api
```

**Rules:**
- Never hardcode URLs or secrets — always use env vars
- Client uses `VITE_` prefix for Vite env vars
- Access in code: `import.meta.env.VITE_API_BASE_URL` (client), `process.env.MONGO_URI` (server)

---

## 17. API Documentation

Document all endpoints in README or a separate `API.md`. Use this format:

```
### POST /api/auth/login

**Description:** Authenticate user and return JWT token

**Request Body:**
{
  "email": "user@example.com",
  "password": "password123"
}

**Success Response (200):**
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "user": { "_id": "...", "name": "...", "email": "...", "role": "sales" }
  }
}

**Error Response (401):**
{
  "success": false,
  "message": "Invalid email or password"
}
```

Document all 8 endpoints this way.

---

## 18. Git Practices (Evaluated)

Commit quality is explicitly evaluated. Follow this:

### Commit Message Format
```
feat: add JWT authentication middleware
fix: resolve pagination off-by-one error
chore: add docker-compose configuration
refactor: extract lead filter logic into utility function
docs: update README with setup instructions
```

### Branch Strategy
```
main          — stable, production-ready
dev           — active development
feature/auth  — specific feature branches
feature/leads-crud
feature/csv-export
feature/rbac
```

### Workflow
- Work on feature branches, merge to dev, merge dev to main when stable
- Write meaningful commits as you build — not one big commit at the end
- At least 15–20 commits showing progression

---

## 19. README.md Template

Your README must include:

```markdown
# Smart Leads Dashboard

## Tech Stack
...

## Features
- JWT Authentication (Register/Login)
- Leads CRUD with RBAC
- Advanced filtering + debounced search
- Backend pagination
- CSV export (admin only)
- Dark mode

## Prerequisites
- Node.js v18+
- MongoDB
- Docker (optional)

## Setup (Local)
1. Clone the repo
2. `cd server && npm install && cp .env.example .env` (fill values)
3. `cd client && npm install && cp .env.example .env`
4. `npm run dev` in both

## Setup (Docker)
1. `cp .env.example .env` (fill JWT_SECRET)
2. `docker-compose up --build`
3. App runs at http://localhost:3000

## API Documentation
See [API.md](./API.md)

## Environment Variables
See [.env.example](./.env.example)

## Default Credentials (for testing)
Admin: admin@test.com / password123
Sales: sales@test.com / password123
```

---

## 20. Build Order (Recommended)

Build in this order to avoid blockers:

1. **Backend foundation** — Express setup, TypeScript config, DB connection, error middleware
2. **User model + Auth routes** — Register, Login, JWT middleware
3. **Lead model + CRUD routes** — All 5 endpoints, no filters yet
4. **Filtering + Pagination** — Add query param parsing and MongoDB filter logic
5. **RBAC** — Role middleware, scope leads by createdBy for sales
6. **CSV Export route**
7. **Docker setup** — Test full stack in containers
8. **Frontend scaffold** — React + Vite + TS + Tailwind, router, auth context
9. **Auth pages** — Login, Register
10. **Leads page** — Table, filters, pagination, debounced search
11. **Lead CRUD UI** — Create/Edit modal, Delete confirmation
12. **Dashboard summary page**
13. **CSV export button**
14. **Loading/Empty/Error states** — Polish everything
15. **Dark mode** (bonus)
16. **README + API docs + .env.example**
17. **Deploy** (Render/Railway for backend, Vercel/Netlify for frontend)

---

## 21. Common Pitfalls to Avoid

| Pitfall | Fix |
|---------|-----|
| Using `any` everywhere | Define proper interfaces for all data |
| Giant components (>200 lines) | Break into smaller components |
| Hardcoded `localhost:5000` | Use `VITE_API_BASE_URL` env var |
| No loading states | Add spinner/skeleton to every async operation |
| Forgetting RBAC on export route | `protect` + `authorize('admin')` middleware |
| Search firing on every keystroke | Use `useDebounce` hook — 500ms delay |
| Mongoose returning password field | Use `select: false` on password field |
| CORS errors | Configure `cors()` on Express with proper origin |
| JWT secret hardcoded | Always from `process.env.JWT_SECRET` |
| No error boundary | Wrap app in ErrorBoundary component |
| Missing `.env.example` | Must be committed (not `.env`) |
| Pagination reset on filter change | Reset to `page: 1` whenever filters change |

---

## 22. Deployment (Preferred)

| Service | What to deploy |
|---------|---------------|
| **Railway** or **Render** | Node.js backend + MongoDB |
| **Vercel** or **Netlify** | React frontend |
| **MongoDB Atlas** | Cloud MongoDB (free tier) |

Set all env vars in the deployment platform's dashboard. Never expose secrets in client-side code.

---

## 23. Evaluation Checklist (Self-Review Before Submitting)

- [ ] TypeScript everywhere — no `.js` files
- [ ] All interfaces/types defined — no unnecessary `any`
- [ ] Auth working: register, login, protected routes
- [ ] Leads CRUD: create, read, update, delete
- [ ] Filters work together: status + source + search simultaneously
- [ ] Search is debounced (500ms)
- [ ] Pagination is backend-side with metadata in response
- [ ] 10 records per page fixed limit
- [ ] RBAC: sales sees only own leads, admin sees all
- [ ] CSV export works (admin only)
- [ ] Docker setup runs with `docker-compose up --build`
- [ ] Loading states on all async operations
- [ ] Empty states when no data
- [ ] Error handling UI (toasts, inline errors)
- [ ] Form validation (frontend + backend)
- [ ] No hardcoded URLs or secrets
- [ ] README complete with setup instructions
- [ ] `.env.example` committed
- [ ] API documented
- [ ] 15+ meaningful git commits
- [ ] Responsive on mobile
- [ ] Dark mode (bonus)
- [ ] Deployment link live

---

*This file was generated as a complete build specification. Treat it as the single source of truth for the entire project.*
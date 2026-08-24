# Hotel Staff Manager

A responsive single-page application for managing hotel staff — view, filter, create, and update staff member records. Built as a React frontend consuming a pre-provided REST API.

**Live Demo:** _[Add your Vercel deployment URL here]_
**GitHub Repo:** _[Add your GitHub repo URL here]_

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Folder Structure](#folder-structure)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Validation Rules](#validation-rules)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Error Handling & Loading States](#error-handling--loading-states)
- [UI/UX Guidelines Followed](#uiux-guidelines-followed)
- [Known Limitations / Notes](#known-limitations--notes)
- [Deliverables Checklist](#deliverables-checklist)

---

## Overview

This project is a **Hotel Staff Manager** — a single-page application that allows hotel administrators to:

1. View all staff members and their details.
2. Filter staff by role, department, shift, or status.
3. Create new staff members.
4. Look up an existing staff member by email and update their details in real time.

The backend API is **already built and hosted** — this repository contains only the **frontend** application that consumes it.

---

## Features

- ✅ **Home Page** — displays all staff members with their full details.
- ✅ **Filter Feature** — filter by role (dropdown, values sourced live from the API), with optional filtering by department, shift, and status.
- ✅ **Create Page** — add a new staff member via a form (Full Name, Email, Phone as text inputs; Role, Shift, Status as dropdowns; Joining Date as a date picker). Displays the newly created staff member's details on success.
- ✅ **Update Flow** — search for a staff member by email, view their existing details, edit any field, and see the updated record reflected immediately after saving.
- ✅ **Responsive Design** — works cleanly across desktop, tablet, and mobile breakpoints.
- ✅ **Loading & Error States** — visible loading indicators for in-flight requests and clear error messages if the API is unreachable or a request fails (no blank screens).
- ✅ **Client-side Validation** — mirrors API validation rules (email format, 10-digit phone, allowed role/shift/status values, date format) before submission.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 (Vite) |
| Routing | React Router v6 |
| State Management | React Context API + `useReducer` |
| HTTP Client | Axios |
| Forms | React Hook Form (optional, for validation) |
| Styling | CSS Modules / Tailwind CSS (mobile-first, responsive) |
| Deployment | Vercel |
| Backend (provided, not built here) | Node.js + Express + MongoDB, hosted on Render |

> **Note:** This is a MERN-stack project in the sense that the frontend (React) talks to a Mongo/Express/Node backend — but the **M-E-N portion is pre-built and externally hosted**. This repo implements the **React (R)** layer only.

---

## Project Architecture

```
┌─────────────────────────────┐
│   React SPA (Vite)          │
│  - Pages (Home/Create/Edit) │
│  - Components                │
│  - Hooks                     │
│  - API Service Layer         │
└──────────────┬───────────────┘
               │ HTTPS (Axios)
               ▼
┌─────────────────────────────┐
│  Provided REST API           │
│  Express + Node (hosted)     │
│  https://testaug.onrender.com│
└──────────────┬───────────────┘
               ▼
┌─────────────────────────────┐
│  MongoDB (managed externally)│
└─────────────────────────────┘
```

**Data flow summary:**
1. `HomePage` fetches staff list + filter options on mount.
2. `FilterBar` updates query params → triggers a re-fetch (debounced for text search).
3. `CreatePage` submits a new staff record via `POST /api/staff`.
4. `UpdatePage` looks up a staff member by email, pre-fills a form, and submits changes via `PUT`/`PATCH /api/staff/:id`.

---

## Folder Structure

```
src/
├── api/
│   └── staffApi.js          # Centralized API calls (get, create, update, delete, filters, stats, health)
├── context/
│   └── StaffContext.jsx     # Global state: staff list, filters, loading, error
├── hooks/
│   ├── useStaffList.js      # Fetch + filter logic
│   ├── useStaffForm.js      # Shared create/update form logic
│   └── useDebounce.js       # Debounced search input
├── pages/
│   ├── HomePage.jsx         # List + filter view
│   ├── CreateStaffPage.jsx  # Create form
│   └── UpdateStaffPage.jsx  # Email lookup → edit → save
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Layout.jsx
│   ├── staff/
│   │   ├── StaffCard.jsx        # Card view (mobile/tablet)
│   │   ├── StaffTable.jsx       # Table view (desktop)
│   │   ├── StaffList.jsx
│   │   ├── FilterBar.jsx
│   │   └── Pagination.jsx
│   ├── forms/
│   │   ├── StaffForm.jsx        # Shared by Create & Update
│   │   └── FormField.jsx
│   └── common/
│       ├── Loader.jsx
│       ├── ErrorBanner.jsx
│       └── EmptyState.jsx
├── constants/
│   └── enums.js              # Fallback role/shift/status values
├── utils/
│   └── validators.js         # Email regex, phone regex, date format checks
├── App.jsx
└── main.jsx
```

---

## API Reference

**Base URL:** `https://testaug.onrender.com`

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | API health check |
| GET | `/api/staff` | Get staff data (supports search, filters, pagination) |
| GET | `/api/staff/:id` | Get a single staff member by ID |
| POST | `/api/staff` | Create a new staff member |
| PUT | `/api/staff/:id` | Full update of a staff member |
| PATCH | `/api/staff/:id` | Partial update (e.g., status only) |
| DELETE | `/api/staff/:id` | Delete a staff member |
| GET | `/api/filters` | Dropdown values (roles, departments, shifts, statuses) |
| GET | `/api/stats` | Counts (total, by role, by status) |

### Query Parameters (`GET /api/staff`)

| Param | Description |
|---|---|
| `q` | Search — partial, case-insensitive match on name, email, phone, or employee code |
| `role` | Exact match. Values sourced from `GET /api/filters` |
| `department` | Exact match (e.g., Food & Beverage) |
| `shift` | Exact match: Morning, Evening, Night |
| `status` | Exact match: Active, On Leave, Inactive |
| `page` | Pagination. Default `page=1` |
| `limit` | Pagination. Default `limit=10` |

### Success Response (list)

```json
{
  "success": true,
  "data": [],
  "meta": {},
  "page": 1,
  "limit": 10,
  "total": 12,
  "totalPages": 2
}
```

### Error Response

```json
{ "success": false, "error": "Staff member not found" }
```

### Create / Update Request Body

```json
{
  "fullName": "Riya Kapoor",
  "email": "riya.kapoor@sunriseinn.test",
  "phone": "9123456789",
  "role": "Front Desk",
  "shift": "Morning",
  "status": "Active",
  "joiningDate": "2026-08-18"
}
```

> ⚠️ **Do not send `department` or `employeeCode`** — the API automatically sets these based on the selected `role`.

---

## Database Schema

**Table: Staff**

| Field | Type | Notes |
|---|---|---|
| `id` * | Unique key | Auto-generated (e.g., `stf_001`) |
| `employeeCode` * | String | Auto-generated by API from role (e.g., `HTL-101`) |
| `fullName` * | String | Text input |
| `email` * | String | Unique, case-insensitive |
| `phone` * | String | Unique, exactly 10 digits |
| `role` * | Enum | Must be one of the allowed roles (dropdown, not free text) |
| `department` | Enum | Auto-derived from role — never sent by the client |
| `shift` | Enum | Morning, Evening, Night |
| `status` | Enum | Active, On Leave, Inactive |
| `joiningDate` | Date | Format: `YYYY-MM-DD` |

### Allowed Values

- **Roles:** General Manager, Front Desk, Housekeeping, Chef, Waiter, Security, Maintenance
- **Shifts:** Morning, Evening, Night
- **Statuses:** Active, On Leave, Inactive

> Seed data (~12 staff members) is already present in the API on load — no manual seeding required.

---

## Validation Rules

| Field | Rule |
|---|---|
| Email | Required, unique, case-insensitive |
| Phone | Required, unique, exactly 10 digits |
| Role | Must be one of the allowed roles — dropdown only, no free text |
| Shift | Dropdown — Morning / Evening / Night |
| Status | Dropdown — Active / On Leave / Inactive |
| Joining Date | Required, format `YYYY-MM-DD` |

All dropdown values are fetched live from `GET /api/filters` rather than hardcoded, so the UI always reflects the current allowed values.

---

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/hotel-staff-manager.git
cd hotel-staff-manager

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env

# 4. Run the development server
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://testaug.onrender.com
```

> All API calls in `src/api/staffApi.js` read from `import.meta.env.VITE_API_BASE_URL` — never hardcode the base URL directly in components.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run linter (if configured) |

---

## Deployment

This project is deployed on **Vercel**.

### Steps to deploy:

1. Push the repository to GitHub.
2. Import the repo into Vercel.
3. Set the environment variable `VITE_API_BASE_URL` in the Vercel project settings.
4. Set build command: `npm run build`, output directory: `dist`.
5. Deploy — Vercel will provide a public URL.

> Do **not** commit `node_modules` — ensure `.gitignore` excludes it.

---

## Error Handling & Loading States

- A global **health check** runs on app load (`GET /health`); if the API is unreachable, a clear error banner is shown instead of a blank page.
- Independent loading indicators for:
  - Staff list fetch
  - Form submission (create/update)
  - Email lookup (update flow)
- Field-level error messages are surfaced from API 4xx responses (e.g., duplicate email, invalid role, staff not found).
- An **empty state** is shown when a filtered search returns zero results.

---

## UI/UX Guidelines Followed

- Built with **React (Vite)** — no unnecessary external UI libraries.
- Staff list renders as **cards on mobile/tablet** and a **table on desktop**.
- Each row/card shows: name, email, phone, role, department, shift, status, and joining date.
- Filtering is available via dropdowns populated from the API (role required; department/shift/status optional).
- Edit/delete controls are accessible directly from the list view.
- Proper input validation with inline error messages (wrong format, duplicate email/phone, API errors, etc.).
- Loading indicators shown during all in-flight requests.

---

## Known Limitations / Notes

- The backend API is external and pre-provided; this repo does not include or modify backend code.
- There is no dedicated "get staff by email" endpoint — the Update flow uses the search (`q`) parameter on `GET /api/staff` and matches the exact email client-side.
- `department` and `employeeCode` are always server-derived and must never be included in Create/Update request payloads.

---

## Deliverables Checklist

- [x] Public GitHub repository with complete frontend code.
- [x] `README.md` with setup and run instructions (this file).
- [x] Vercel deployment URL of the hosted frontend.
- [x] `node_modules` excluded from version control.

---

## Author

**Pranav Gupta**
Final Year ECE Student, Bhagwan Parshuram Institute of Technology (BPIT)
GitHub: [github.com/pranavgupta6](https://github.com/pranavgupta6)
Email: gpranav859@gmail.com